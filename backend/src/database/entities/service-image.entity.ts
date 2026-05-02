import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_images')
export class ServiceImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'public_id', length: 255, nullable: true })
  publicId: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Service, (service) => service.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
