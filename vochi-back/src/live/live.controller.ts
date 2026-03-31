import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

interface TokenRequestBody {
  interviewId: string;
}

interface OpenAIRealtimeSession {
  client_secret: {
    value: string;
    expires_at: number;
  };
}

@Controller('live')
export class LiveController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('token')
  @UseGuards(AuthGuard)
  async getRealtimeToken(
    @Body() body: TokenRequestBody,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ token: string }> {
    const { interviewId } = body;
    const userId = req.userId;

    if (!interviewId) {
      throw new BadRequestException('interviewId es requerido');
    }

    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, userId, status: 'active' },
    });

    if (!interview) {
      throw new NotFoundException('Entrevista no encontrada');
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const promptId =
      interview.type === 'tecnica'
        ? process.env.OPENAI_REALTIME_PROMPT_ID_TECHNICAL
        : process.env.OPENAI_REALTIME_PROMPT_ID_RRHH;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY no está configurado',
      );
    }

    if (!promptId) {
      throw new InternalServerErrorException(
        `OPENAI_REALTIME_PROMPT_ID_${interview.type === 'tecnica' ? 'TECHNICAL' : 'RRHH'} no está configurado`,
      );
    }

    const sessionBody = {
      model: 'gpt-realtime-1.5',
      prompt: { id: promptId },
    };

    const response = await fetch(
      'https://api.openai.com/v1/realtime/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionBody),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[live/token] OpenAI error', {
        status: response.status,
        body: errorText,
      });
      throw new InternalServerErrorException(
        'No se pudo generar el token efímero de OpenAI',
      );
    }

    const data = (await response.json()) as OpenAIRealtimeSession;

    return { token: data.client_secret.value };
  }
}
