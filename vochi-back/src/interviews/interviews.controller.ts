import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('interviews')
@UseGuards(AuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.interviewsService.findAll(req.userId);
  }

  @Post('start')
  @HttpCode(201)
  create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      jobDescription: string;
      company?: string;
      role?: string;
      type: string;
    },
  ) {
    return this.interviewsService.create(req.userId, body);
  }

  @Post(':id/end')
  @HttpCode(200)
  end(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.interviewsService.end(id, req.userId);
  }

  @Post(':id/abandon')
  @HttpCode(200)
  abandon(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.interviewsService.abandon(id, req.userId);
  }

  @Post(':id/disconnect')
  @HttpCode(200)
  disconnect(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.interviewsService.disconnect(id, req.userId);
  }

  @Get(':id/feedback')
  getFeedback(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.interviewsService.getFeedback(id, req.userId);
  }

  @Post(':id/feedback/regenerate')
  @HttpCode(200)
  regenerateFeedback(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.interviewsService.regenerateFeedback(id, req.userId);
  }
}
