import { User } from './user.entity';
export declare enum NotificationType {
    BOOKING_CREATED = "booking_created",
    BOOKING_CONFIRMED = "booking_confirmed",
    BOOKING_CANCELLED = "booking_cancelled",
    BOOKING_REMINDER = "booking_reminder",
    BOOKING_COMPLETED = "booking_completed",
    PAYMENT_RECEIVED = "payment_received",
    PAYMENT_FAILED = "payment_failed",
    PAYOUT_COMPLETED = "payout_completed",
    NEW_REVIEW = "new_review",
    REVIEW_RESPONSE = "review_response",
    NEW_MESSAGE = "new_message",
    PROVIDER_VERIFIED = "provider_verified",
    SERVICE_APPROVED = "service_approved",
    SERVICE_REJECTED = "service_rejected",
    WELCOME = "welcome",
    SYSTEM_UPDATE = "system_update"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown>;
    isRead: boolean;
    readAt: Date;
    createdAt: Date;
    user: User;
}
