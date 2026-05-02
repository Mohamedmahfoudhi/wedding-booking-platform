import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly messagesService;
    server: Server;
    private userSockets;
    constructor(messagesService: MessagesService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, data: {
        conversationId: string;
    }): void;
    handleLeaveConversation(client: Socket, data: {
        conversationId: string;
    }): void;
    handleSendMessage(client: Socket, data: {
        conversationId: string;
        senderId: string;
        content: string;
        attachmentUrl?: string;
    }): Promise<import("../../database/entities").Message>;
    handleTyping(client: Socket, data: {
        conversationId: string;
        userId: string;
    }): void;
    handleStopTyping(client: Socket, data: {
        conversationId: string;
        userId: string;
    }): void;
    handleMarkRead(client: Socket, data: {
        conversationId: string;
        userId: string;
    }): Promise<void>;
    notifyUser(userId: string, event: string, data: unknown): void;
}
