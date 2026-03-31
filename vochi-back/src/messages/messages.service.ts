import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(interviewId: string, role: 'ai' | 'user', text: string) {
    return this.prisma.message.create({
      data: { interviewId, role, text },
    });
  }

  async findByInterview(interviewId: string) {
    return this.prisma.message.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
