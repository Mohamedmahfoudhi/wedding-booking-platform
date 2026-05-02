import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
export declare class NotificationsService {
    private readonly notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    create(userId: string, type: NotificationType, title: string, message: string, data?: Record<string, unknown>): Promise<Notification>;
    findByUser(userId: string, page?: number, limit?: number): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(id: string, userId: string): Promise<void>;
}
