import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { User } from '../../database/entities/user.entity';
export declare class MessagesController {
    private readonly messagesService;
    private readonly messagesGateway;
    constructor(messagesService: MessagesService, messagesGateway: MessagesGateway);
    getConversations(user: User): Promise<{
        conversations: import("../../database/entities").Conversation[];
    }>;
    startConversation(user: User, body: {
        providerId: string;
        serviceId?: string;
    }): Promise<{
        conversation: import("../../database/entities").Conversation;
    }>;
    getUnreadCount(user: User): Promise<{
        count: number;
    }>;
    getConversation(user: User, id: string): Promise<{
        conversation: import("../../database/entities").Conversation;
    }>;
    getMessages(user: User, id: string, page?: number, limit?: number): Promise<{
        messages: import("../../database/entities").Message[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    sendMessage(user: User, id: string, body: {
        content: string;
        attachmentUrl?: string;
    }): Promise<{
        message: import("../../database/entities").Message;
    }>;
    markAsRead(user: User, id: string): Promise<{
        message: string;
    }>;
}
