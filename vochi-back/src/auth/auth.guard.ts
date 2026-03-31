import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './auth.types';
import { FirebaseAuthService } from './firebase-auth.service';
import { extractBearerTokenFromRequest } from './token.utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const user = await this.firebaseAuthService.authenticate(token);

    request.user = user;
    request.userId = user.userId;
    request.email = user.email;
    request.firebaseUid = user.firebaseUid;

    return true;
  }
}
