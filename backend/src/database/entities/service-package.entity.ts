import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_packages')
export class ServicePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  price: number;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Service, (service) => service.packages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
