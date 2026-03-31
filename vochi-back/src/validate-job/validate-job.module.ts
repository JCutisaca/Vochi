import { Module } from '@nestjs/common';
import { ValidateJobController } from './validate-job.controller';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [ValidateJobController],
})
export class ValidateJobModule {}
