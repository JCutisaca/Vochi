import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  App,
  ServiceAccount,
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './auth.types';

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
};

@Injectable()
export class FirebaseAuthService {
  private readonly firebaseApp: App;
  private readonly ALLOWED_EMAILS: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.firebaseApp = this.getOrCreateFirebaseApp();
    this.ALLOWED_EMAILS =
      this.configService
        .get<string>('ALLOWED_EMAILS')
        ?.split(',')
        .map((email) => email.trim().toLowerCase()) ?? [];
  }

  async authenticate(idToken: string): Promise<AuthenticatedUser> {
    const token = idToken.trim();

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await getAuth(this.firebaseApp).verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const email = decodedToken.email?.toLowerCase();
    if (!email || !this.ALLOWED_EMAILS.includes(email)) {
      throw new UnauthorizedException('No tenés acceso a esta aplicación');
    }

    return this.resolveUser(decodedToken);
  }

  private async resolveUser(
    decodedToken: DecodedIdToken,
  ): Promise<AuthenticatedUser> {
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'firebase',
          providerAccountId: decodedToken.uid,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      const user = await this.syncUserProfile(
        existingAccount.user,
        decodedToken,
      );
      return {
        userId: user.id,
        email: user.email,
        firebaseUid: decodedToken.uid,
      };
    }

    const email = this.getEmailFromToken(decodedToken);

    const user = await this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: this.getOptionalString(decodedToken.name),
        image: this.getOptionalString(decodedToken.picture),
        emailVerified: decodedToken.email_verified ? new Date() : null,
      },
      update: {
        name: this.getOptionalString(decodedToken.name) ?? undefined,
        image: this.getOptionalString(decodedToken.picture) ?? undefined,
        emailVerified: decodedToken.email_verified ? new Date() : undefined,
      },
    });

    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'firebase',
          providerAccountId: decodedToken.uid,
        },
      },
      create: {
        userId: user.id,
        type: 'firebase',
        provider: 'firebase',
        providerAccountId: decodedToken.uid,
      },
      update: {
        userId: user.id,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      firebaseUid: decodedToken.uid,
    };
  }

  private async syncUserProfile(
    user: UserProfile,
    decodedToken: DecodedIdToken,
  ): Promise<UserProfile> {
    const nextEmail = this.getOptionalEmail(decodedToken);
    const nextName = this.getOptionalString(decodedToken.name);
    const nextImage = this.getOptionalString(decodedToken.picture);
    const updates: Partial<UserProfile> = {};

    if (nextEmail && nextEmail !== user.email) {
      const emailOwner = await this.prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (!emailOwner || emailOwner.id === user.id) {
        updates.email = nextEmail;
      }
    }

    if (nextName && nextName !== user.name) {
      updates.name = nextName;
    }

    if (nextImage && nextImage !== user.image) {
      updates.image = nextImage;
    }

    if (decodedToken.email_verified && !user.emailVerified) {
      updates.emailVerified = new Date();
    }

    if (Object.keys(updates).length === 0) {
      return user;
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
  }

  private getOrCreateFirebaseApp(): App {
    const existingApp = getApps()[0];
    if (existingApp) {
      return existingApp;
    }

    const serviceAccount = this.resolveServiceAccount();
    const projectId =
      serviceAccount?.projectId ??
      this.configService.get<string>('FIREBASE_PROJECT_ID') ??
      undefined;

    if (serviceAccount) {
      return initializeApp({
        credential: cert(serviceAccount),
        ...(projectId ? { projectId } : {}),
      });
    }

    if (!projectId) {
      throw new InternalServerErrorException(
        'Firebase Admin no está configurado. Definí FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_PROJECT_ID.',
      );
    }

    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  }

  private resolveServiceAccount(): ServiceAccount | null {
    const projectId =
      this.configService.get<string>('FIREBASE_PROJECT_ID') ??
      this.configService.get<string>('GOOGLE_CLOUD_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey) {
      return {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      };
    }

    // const rawJson =
    //   this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON') ??
    //   this.configService.get<string>('GOOGLE_CREDENTIALS_JSON');

    // if (rawJson) {
    //   return this.parseServiceAccount(rawJson);
    // }

    return null;
  }

  // private parseServiceAccount(rawJson: string): ServiceAccount {
  //   try {
  //     const parsed = JSON.parse(rawJson) as Record<string, unknown>;
  //     const projectId =
  //       this.readString(parsed.projectId) ?? this.readString(parsed.project_id);
  //     const clientEmail =
  //       this.readString(parsed.clientEmail) ??
  //       this.readString(parsed.client_email);
  //     const privateKey =
  //       this.readString(parsed.privateKey) ??
  //       this.readString(parsed.private_key);

  //     if (!projectId || !clientEmail || !privateKey) {
  //       throw new Error('Missing required service account fields');
  //     }

  //     return {
  //       projectId,
  //       clientEmail,
  //       privateKey: privateKey.replace(/\\n/g, '\n'),
  //     };
  //   } catch {
  //     throw new InternalServerErrorException(
  //       'No se pudo parsear la configuración de Firebase Admin.',
  //     );
  //   }
  // }

  private getEmailFromToken(decodedToken: DecodedIdToken): string {
    const email = this.getOptionalEmail(decodedToken);

    if (!email) {
      throw new UnauthorizedException(
        'El token de Firebase no incluye un email.',
      );
    }

    return email;
  }

  private getOptionalEmail(decodedToken: DecodedIdToken): string | null {
    const email = this.getOptionalString(decodedToken.email);
    return email ? email.toLowerCase() : null;
  }

  private getOptionalString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : null;
  }

  // private readString(value: unknown): string | null {
  //   return typeof value === 'string' && value.length > 0 ? value : null;
  // }
}
