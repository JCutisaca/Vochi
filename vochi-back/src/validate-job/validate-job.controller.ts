import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { GroqService, JobValidationResult } from '../ai/groq.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('validate-job')
@UseGuards(AuthGuard)
export class ValidateJobController {
  constructor(private readonly groq: GroqService) {}

  @Post()
  @HttpCode(200)
  async validate(@Body() body: { text: string }): Promise<JobValidationResult> {
    if (!body.text || body.text.trim().length < 50) {
      return {
        valid: false,
        reason: 'El texto es demasiado corto para ser una oferta de trabajo',
      };
    }

    return this.groq.validateJobDescription(body.text);
  }
}
