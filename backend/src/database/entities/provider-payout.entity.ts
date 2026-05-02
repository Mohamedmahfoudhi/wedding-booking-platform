import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { Booking } from './booking.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('provider_payouts')
export class ProviderPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({ name: 'stripe_transfer_id', length: 255, nullable: true })
  stripeTransferId: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  commission: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 3 })
  netAmount: number;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProviderProfile, (provider) => provider.payouts)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
