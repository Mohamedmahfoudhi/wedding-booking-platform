import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['clientId', 'providerId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'service_id', nullable: true })
  serviceId: string;

  @Column({ name: 'booking_id', nullable: true })
  bookingId: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => ProviderProfile, (provider) => provider.conversations)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
