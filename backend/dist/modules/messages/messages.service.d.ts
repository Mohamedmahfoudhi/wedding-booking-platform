import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
export declare class MessagesService {
    private readonly conversationRepository;
    private readonly messageRepository;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>);
    findOrCreateConversation(clientId: string, providerId: string, serviceId?: string): Promise<Conversation>;
    getConversations(userId: string, isProvider: boolean): Promise<Conversation[]>;
    getConversation(conversationId: string, userId: string): Promise<Conversation>;
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
        messages: Message[];
        total: number;
    }>;
    sendMessage(conversationId: string, senderId: string, content: string, attachmentUrl?: string): Promise<Message>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string, isProvider: boolean): Promise<number>;
}
