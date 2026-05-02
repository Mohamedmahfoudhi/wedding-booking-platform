import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('blocked_dates')
export class BlockedDate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ length: 255, nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Service, (service) => service.blockedDates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
