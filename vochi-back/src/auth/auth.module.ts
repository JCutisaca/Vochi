import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { FirebaseAuthService } from './firebase-auth.service';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [FirebaseAuthService, AuthGuard, WsAuthGuard],
  exports: [FirebaseAuthService, AuthGuard, WsAuthGuard],
})
export class AuthModule {}
