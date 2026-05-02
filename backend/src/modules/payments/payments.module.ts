import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController, ProviderStripeController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { Payment } from '../../database/entities/payment.entity';
import { ProviderPayout } from '../../database/entities/provider-payout.entity';
import { Booking } from '../../database/entities/booking.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, ProviderPayout, Booking, ProviderProfile]),
    ProvidersModule,
  ],
  controllers: [PaymentsController, ProviderStripeController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
