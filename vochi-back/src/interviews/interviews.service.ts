import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { GroqService } from 'src/ai/groq.service';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private groq: GroqService,
    private messages: MessagesService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.interview.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        company: true,
        role: true,
        type: true,
        status: true,
        score: true,
        duration: true,
        createdAt: true,
        deletedAt: true,
      },
    });
  }

  async create(
    userId: string,
    data: {
      jobDescription: string;
      company?: string;
      role?: string;
      type: string;
    },
  ) {
    return this.prisma.interview.create({
      data: {
        userId,
        jobDescription: data.jobDescription,
        company: data.company ?? null,
        role: data.role ?? null,
        type: data.type,
        status: 'active',
      },
    });
  }

  async end(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, userId, status: 'active', deletedAt: null },
    });

    if (!interview) {
      throw new NotFoundException('Entrevista no encontrada');
    }

    const duration = Math.floor(
      (new Date().getTime() - interview.createdAt.getTime()) / 1000,
    );

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'finished', duration },
    });

    return { success: true, interviewId, duration };
  }

  async getFeedback(interviewId: string, userId: string, force = false) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, userId, deletedAt: null },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!interview) {
      throw new NotFoundException('Entrevista no encontrada');
    }

    if (interview.feedback && !force) {
      return interview.feedback;
    }

    const transcript = interview.messages.map((m) => ({
      role: m.role as 'ai' | 'user',
      text: m.text,
    }));

    const userMessages = transcript.filter((m) => m.role === 'user');
    if (userMessages.length === 0) {
      throw new UnprocessableEntityException(
        'No hay respuestas del candidato registradas. La transcripción del usuario no se guardó correctamente durante la entrevista.',
      );
    }

    const feedback = await this.groq.generateFeedback(
      interview.jobDescription,
      interview.type as 'rrhh' | 'tecnica',
      transcript,
      interview.status as 'finished' | 'abandoned',
    );

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: { feedback: feedback as any, score: feedback.score },
    });

    return feedback;
  }

  async regenerateFeedback(interviewId: string, userId: string) {
    return this.getFeedback(interviewId, userId, true);
  }

  async abandon(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, userId, deletedAt: null },
    });

    if (!interview) {
      throw new NotFoundException('Entrevista no encontrada');
    }

    const duration = Math.floor(
      (new Date().getTime() - interview.createdAt.getTime()) / 1000,
    );

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'abandoned', duration },
    });

    return { success: true, interviewId, duration };
  }

  async disconnect(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, userId, deletedAt: null },
    });

    if (!interview) {
      throw new NotFoundException('Entrevista no encontrada');
    }

    const duration = Math.floor(
      (new Date().getTime() - interview.createdAt.getTime()) / 1000,
    );

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'disconnected', duration },
    });

    return { success: true, interviewId };
  }
}
