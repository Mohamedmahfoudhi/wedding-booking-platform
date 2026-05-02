import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', unique: true })
  bookingId: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'provider_response', type: 'text', nullable: true })
  providerResponse: string;

  @Column({ name: 'response_date', type: 'timestamp', nullable: true })
  responseDate: Date;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Booking, (booking) => booking.review)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Service, (service) => service.reviews)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'client_id' })
  client: User;
}
