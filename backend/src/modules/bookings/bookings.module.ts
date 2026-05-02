import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController, ProviderBookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { AvailabilityModule } from '../availability/availability.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Service, ProviderProfile]),
    AvailabilityModule,
    NotificationsModule,
    ProvidersModule,
  ],
  controllers: [BookingsController, ProviderBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
