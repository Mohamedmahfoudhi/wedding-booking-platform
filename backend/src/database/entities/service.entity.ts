import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { Category } from './category.entity';
import { ServiceImage } from './service-image.entity';
import { ServicePackage } from './service-package.entity';
import { Availability } from './availability.entity';
import { BlockedDate } from './blocked-date.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Favorite } from './favorite.entity';

export enum PriceType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  DAILY = 'daily',
  CUSTOM = 'custom',
}

export enum ServiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'short_description', length: 500, nullable: true })
  shortDescription: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 3 })
  basePrice: number;

  @Column({
    name: 'price_type',
    type: 'enum',
    enum: PriceType,
    default: PriceType.FIXED,
  })
  priceType: PriceType;

  @Column({ name: 'duration_minutes', nullable: true })
  durationMinutes: number;

  @Column({ name: 'capacity_min', nullable: true })
  capacityMin: number;

  @Column({ name: 'capacity_max', nullable: true })
  capacityMax: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.PENDING,
  })
  status: ServiceStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'booking_count', default: 0 })
  bookingCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProviderProfile, (provider) => provider.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Category, (category) => category.services)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ServiceImage, (image) => image.service, { cascade: true })
  images: ServiceImage[];

  @OneToMany(() => ServicePackage, (pkg) => pkg.service, { cascade: true })
  packages: ServicePackage[];

  @OneToMany(() => Availability, (availability) => availability.service, {
    cascade: true,
  })
  availability: Availability[];

  @OneToMany(() => BlockedDate, (blockedDate) => blockedDate.service, {
    cascade: true,
  })
  blockedDates: BlockedDate[];

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.service)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.service)
  favorites: Favorite[];
}
