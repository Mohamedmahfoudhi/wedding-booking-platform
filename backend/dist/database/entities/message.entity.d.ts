import { User } from './user.entity';
import { Conversation } from './conversation.entity';
export declare class Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachmentUrl: string;
    isRead: boolean;
    readAt: Date;
    createdAt: Date;
    conversation: Conversation;
    sender: User;
}
