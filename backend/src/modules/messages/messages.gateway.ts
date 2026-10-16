import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const filtered = sockets.filter((id) => id !== client.id);
      if (filtered.length > 0) {
        this.userSockets.set(userId, filtered);
      } else {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      conversationId: string;
      senderId: string;
      content: string;
      attachmentUrl?: string;
    },
  ) {
    const message = await this.messagesService.sendMessage(
      data.conversationId,
      data.senderId,
      data.content,
      data.attachmentUrl,
    );

    // Emit to all in conversation
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('new_message', message);

    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    client.to(`conversation:${data.conversationId}`).emit('user_stopped_typing', {
      userId: data.userId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    await this.messagesService.markAsRead(data.conversationId, data.userId);

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('messages_read', { userId: data.userId });
  }

  // Helper method to notify users
  notifyUser(userId: string, event: string, data: unknown) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  // Called by the REST controller after a message is persisted so the other
  // participant (who may be subscribed via socket only) gets it live.
  broadcastNewMessage(conversationId: string, message: unknown) {
    this.server.to(`conversation:${conversationId}`).emit('new_message', message);
  }
}
