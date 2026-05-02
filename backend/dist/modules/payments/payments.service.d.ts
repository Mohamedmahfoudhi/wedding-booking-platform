import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentType } from '../../database/entities/payment.entity';
import { ProviderPayout } from '../../database/entities/provider-payout.entity';
import { Booking } from '../../database/entities/booking.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { StripeService } from './stripe.service';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly payoutRepository;
    private readonly bookingRepository;
    private readonly providerRepository;
    private readonly stripeService;
    private readonly configService;
    constructor(paymentRepository: Repository<Payment>, payoutRepository: Repository<ProviderPayout>, bookingRepository: Repository<Booking>, providerRepository: Repository<ProviderProfile>, stripeService: StripeService, configService: ConfigService);
    createPaymentIntent(bookingId: string, type: PaymentType, amount?: number): Promise<{
        clientSecret: string;
        paymentId: string;
    }>;
    handlePaymentSuccess(paymentIntentId: string): Promise<void>;
    handlePaymentFailed(paymentIntentId: string): Promise<void>;
    processRefund(paymentId: string, amount?: number, reason?: string): Promise<Payment>;
    getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
    getPaidAmount(bookingId: string): Promise<number>;
    createProviderStripeAccount(providerId: string, email: string): Promise<{
        accountId: string;
        accountLinkUrl: string;
    }>;
    getProviderStripeStatus(providerId: string): Promise<{
        onboarded: boolean;
        accountId: string | null;
        dashboardUrl?: string;
    }>;
    getProviderPayouts(providerId: string, page?: number, limit?: number): Promise<{
        payouts: ProviderPayout[];
        total: number;
    }>;
    createPayout(bookingId: string, amount: number, commission: number): Promise<ProviderPayout>;
}
