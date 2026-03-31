import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FirebaseAuthService } from '../auth/firebase-auth.service';
import { AuthenticatedSocket } from '../auth/auth.types';
import { extractTokenFromSocket } from '../auth/token.utils';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' },
  namespace: '/live',
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messages: MessagesService,
    private prisma: PrismaService,
    private firebaseAuthService: FirebaseAuthService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = extractTokenFromSocket(client);
    const { interviewId } = client.handshake.query as Record<string, string>;

    if (!token || !interviewId) {
      client.emit('error', { message: 'Token e interviewId son requeridos' });
      client.disconnect();
      return;
    }

    let userId: string;
    try {
      const user = await this.firebaseAuthService.authenticate(token);
      client.data.user = user;
      client.data.userId = user.userId;
      client.data.email = user.email;
      client.data.firebaseUid = user.firebaseUid;
      userId = user.userId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Token inválido o expirado';
      client.emit('error', { message });
      client.disconnect();
      return;
    }

    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, userId, status: 'active' },
    });

    if (!interview) {
      client.emit('error', { message: 'Entrevista no encontrada' });
      client.disconnect();
      return;
    }

    client.data.interviewId = interviewId;

    client.emit('ready', { message: 'Conectado' });
  }

  handleDisconnect(client: Socket) {
    const interviewId = (client.data as { interviewId?: string }).interviewId;
    if (interviewId) {
      console.log(
        `[live:${interviewId.slice(-6)}] client_disconnected clientId=${client.id}`,
      );
    }
  }

  @SubscribeMessage('ai_transcript')
  async handleAiTranscript(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { text: string },
  ) {
    const interviewId = (client.data as { interviewId?: string }).interviewId;
    if (!interviewId || !payload?.text) return;
    await this.messages.create(interviewId, 'ai', payload.text);
  }

  @SubscribeMessage('user_transcript')
  async handleUserTranscript(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { text: string },
  ) {
    const interviewId = (client.data as { interviewId?: string }).interviewId;
    if (!interviewId || !payload?.text) return;
    await this.messages.create(interviewId, 'user', payload.text);
  }
}
