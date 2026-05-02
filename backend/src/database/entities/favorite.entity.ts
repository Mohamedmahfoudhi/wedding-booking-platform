import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';

@Entity('favorites')
@Unique(['userId', 'serviceId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Service, (service) => service.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
