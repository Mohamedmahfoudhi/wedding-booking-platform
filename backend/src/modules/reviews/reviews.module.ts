import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../../database/entities/review.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Booking, Service]),
    ProvidersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
