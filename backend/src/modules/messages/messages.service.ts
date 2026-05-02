import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findOrCreateConversation(
    clientId: string,
    providerId: string,
    serviceId?: string,
  ): Promise<Conversation> {
    let conversation = await this.conversationRepository.findOne({
      where: { clientId, providerId },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        clientId,
        providerId,
        serviceId,
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  async getConversations(
    userId: string,
    isProvider: boolean,
  ): Promise<Conversation[]> {
    const where = isProvider ? { providerId: userId } : { clientId: userId };

    return this.conversationRepository.find({
      where,
      relations: ['client', 'provider', 'provider.user', 'service'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['client', 'provider', 'provider.user', 'service', 'messages'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check access
    if (conversation.clientId !== userId && conversation.provider.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    // Verify access first
    await this.getConversation(conversationId, userId);

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { messages: messages.reverse(), total };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachmentUrl?: string,
  ): Promise<Message> {
    // Verify access
    await this.getConversation(conversationId, senderId);

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
      attachmentUrl,
    });

    await this.messageRepository.save(message);

    // Update conversation last message time
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository.update(
      { conversationId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string, isProvider: boolean): Promise<number> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation')
      .leftJoin('conversation.provider', 'provider')
      .where('message.isRead = :isRead', { isRead: false })
      .andWhere('message.senderId != :userId', { userId });

    if (isProvider) {
      query.andWhere('provider.userId = :userId', { userId });
    } else {
      query.andWhere('conversation.clientId = :userId', { userId });
    }

    return query.getCount();
  }
}
