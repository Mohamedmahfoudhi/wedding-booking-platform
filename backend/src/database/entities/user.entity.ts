import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ProviderProfile } from './provider-profile.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Favorite } from './favorite.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { RefreshToken } from './refresh-token.entity';

export enum UserRole {
  CLIENT = 'client',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'verification_token', nullable: true })
  @Exclude()
  verificationToken: string;

  @Column({ name: 'reset_password_token', nullable: true })
  @Exclude()
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  @Exclude()
  resetPasswordExpires: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => ProviderProfile, (profile) => profile.user)
  providerProfile: ProviderProfile;

  @OneToMany(() => Booking, (booking) => booking.client)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.client)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
