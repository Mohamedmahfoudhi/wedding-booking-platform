import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'day_of_week' })
  dayOfWeek: number; // 0-6, 0 = Sunday

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  // Relations
  @ManyToOne(() => Service, (service) => service.availability, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
