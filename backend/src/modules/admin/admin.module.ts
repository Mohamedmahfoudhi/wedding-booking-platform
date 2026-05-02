import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../database/entities/user.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { Service } from '../../database/entities/service.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Review } from '../../database/entities/review.entity';
import { Category } from '../../database/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ProviderProfile,
      Service,
      Booking,
      Payment,
      Review,
      Category,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
