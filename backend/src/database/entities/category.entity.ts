import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'name_ar', length: 100, nullable: true })
  nameAr: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
