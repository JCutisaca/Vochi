import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from './auth.types';
import { FirebaseAuthService } from './firebase-auth.service';
import { extractTokenFromSocket } from './token.utils';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = extractTokenFromSocket(client);

    if (!token) {
      throw new WsException('Token no encontrado');
    }

    try {
      const user = await this.firebaseAuthService.authenticate(token);
      client.data.user = user;
      client.data.userId = user.userId;
      client.data.email = user.email;
      client.data.firebaseUid = user.firebaseUid;
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Token inválido o expirado';
      throw new WsException(message);
    }
  }
}
