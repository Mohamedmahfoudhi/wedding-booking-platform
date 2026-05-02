import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      data,
    });

    return this.notificationRepository.save(notification);
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id, userId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }
}
