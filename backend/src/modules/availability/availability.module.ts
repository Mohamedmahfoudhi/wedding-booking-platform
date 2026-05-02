import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController, ProviderAvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { Availability } from '../../database/entities/availability.entity';
import { BlockedDate } from '../../database/entities/blocked-date.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, BlockedDate, Booking, Service])],
  controllers: [AvailabilityController, ProviderAvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
