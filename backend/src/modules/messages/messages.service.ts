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
    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.client', 'client')
      .leftJoinAndSelect('conversation.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'providerUser')
      .leftJoinAndSelect('conversation.service', 'service')
      .orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST');

    // conversation.providerId is a FK to provider_profiles.id, so for a provider
    // user we must match against provider.userId (the owner), not userId directly.
    if (isProvider) {
      query.where('provider.user_id = :userId', { userId });
    } else {
      query.where('conversation.client_id = :userId', { userId });
    }

    return query.getMany();
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['client', 'provider', 'provider.user', 'service'],
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

    const created = this.messageRepository.create({
      conversationId,
      senderId,
      content,
      attachmentUrl,
    });

    const saved = await this.messageRepository.save(created);

    // Update conversation last message time
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    // Reload with sender so the client can render the bubble on the correct side.
    return this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    }) as Promise<Message>;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify access first.
    await this.getConversation(conversationId, userId);

    // Only mark messages from the OTHER party — your own messages stay as-is.
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId })
      .andWhere('is_read = false')
      .execute();
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
