import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LiveGateway } from './live.gateway';
import { LiveController } from './live.controller';
import { MessagesModule } from '../messages/messages.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AuthModule, MessagesModule, PrismaModule],
  controllers: [LiveController],
  providers: [LiveGateway],
})
export class LiveModule {}
