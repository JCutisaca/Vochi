import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GroqService } from './ai/groq.service';
import { InterviewsService } from './interviews/interviews.service';
import { InterviewsModule } from './interviews/interviews.module';
import { MessagesModule } from './messages/messages.module';
import { ValidateJobModule } from './validate-job/validate-job.module';
import { LiveModule } from './live/live.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    InterviewsModule,
    MessagesModule,
    ValidateJobModule,
    LiveModule,
  ],
  controllers: [AppController],
  providers: [AppService, GroqService, InterviewsService],
})
export class AppModule {}
