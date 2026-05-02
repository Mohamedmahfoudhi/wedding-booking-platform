import { NotificationsService } from './notifications.service';
import { User } from '../../database/entities/user.entity';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: User, page?: number, limit?: number): Promise<{
        notifications: import("../../database/entities").Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(user: User): Promise<{
        count: number;
    }>;
    markAsRead(user: User, id: string): Promise<{
        message: string;
    }>;
    markAllAsRead(user: User): Promise<{
        message: string;
    }>;
    delete(user: User, id: string): Promise<{
        message: string;
    }>;
}
