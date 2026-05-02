import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

export enum PaymentType {
  DEPOSIT = 'deposit',
  FULL = 'full',
  REMAINING = 'remaining',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({ name: 'stripe_payment_id', length: 255, nullable: true })
  stripePaymentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  amount: number;

  @Column({ length: 3, default: 'TND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ length: 50, nullable: true })
  method: string;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 3, nullable: true })
  refundAmount: number;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
