import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { ServicePackage } from './service-package.entity';
import { Payment } from './payment.entity';
import { Review } from './review.entity';

export enum BookingSource {
  MARKETPLACE = 'marketplace',
  SAAS = 'saas',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum CancelledBy {
  CLIENT = 'client',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_number', unique: true, length: 20 })
  bookingNumber: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'package_id', nullable: true })
  packageId: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  @Column({ name: 'guest_count', nullable: true })
  guestCount: number;

  @Column({
    type: 'enum',
    enum: BookingSource,
    default: BookingSource.MARKETPLACE,
  })
  source: BookingSource;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  total: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 3, nullable: true })
  depositAmount: number;

  @Column({ name: 'deposit_paid', default: false })
  depositPaid: boolean;

  @Column({ name: 'fully_paid', default: false })
  fullyPaid: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Client info (for SAAS bookings without registered user)
  @Column({ name: 'client_name', length: 200, nullable: true })
  clientName: string;

  @Column({ name: 'client_email', length: 255, nullable: true })
  clientEmail: string;

  @Column({ name: 'client_phone', length: 20, nullable: true })
  clientPhone: string;

  @Column({
    name: 'cancelled_by',
    type: 'enum',
    enum: CancelledBy,
    nullable: true,
  })
  cancelledBy: CancelledBy;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Service, (service) => service.bookings)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => ServicePackage, { nullable: true })
  @JoinColumn({ name: 'package_id' })
  package: ServicePackage;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => ProviderProfile, (provider) => provider.bookings)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToOne(() => Review, (review) => review.booking)
  review: Review;
}
