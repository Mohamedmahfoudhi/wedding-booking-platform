import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  // Booking
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_COMPLETED = 'booking_completed',

  // Payment
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  PAYOUT_COMPLETED = 'payout_completed',

  // Review
  NEW_REVIEW = 'new_review',
  REVIEW_RESPONSE = 'review_response',

  // Message
  NEW_MESSAGE = 'new_message',

  // Provider
  PROVIDER_VERIFIED = 'provider_verified',
  SERVICE_APPROVED = 'service_approved',
  SERVICE_REJECTED = 'service_rejected',

  // System
  WELCOME = 'welcome',
  SYSTEM_UPDATE = 'system_update',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 50 })
  type: NotificationType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown>;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
