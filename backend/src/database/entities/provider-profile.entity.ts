import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
import { Conversation } from './conversation.entity';
import { ProviderPayout } from './provider-payout.entity';

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'business_name', length: 200 })
  businessName: string;

  @Column({ unique: true, length: 200 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  logo: string;

  @Column({ name: 'cover_image', length: 500, nullable: true })
  coverImage: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  governorate: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'stripe_account_id', length: 255, nullable: true })
  stripeAccountId: string;

  @Column({ name: 'stripe_onboarded', default: false })
  stripeOnboarded: boolean;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 10.0,
  })
  commissionRate: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalRevenue: number;

  @Column({ name: 'total_bookings', default: 0 })
  totalBookings: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.providerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.provider)
  bookings: Booking[];

  @OneToMany(() => Conversation, (conversation) => conversation.provider)
  conversations: Conversation[];

  @OneToMany(() => ProviderPayout, (payout) => payout.provider)
  payouts: ProviderPayout[];
}
