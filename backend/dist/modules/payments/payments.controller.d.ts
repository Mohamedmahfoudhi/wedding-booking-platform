import { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { User } from '../../database/entities/user.entity';
import { PaymentType } from '../../database/entities/payment.entity';
import { ProvidersService } from '../providers/providers.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly stripeService;
    private readonly configService;
    constructor(paymentsService: PaymentsService, stripeService: StripeService, configService: ConfigService);
    createPaymentIntent(body: {
        bookingId: string;
        type: PaymentType;
        amount?: number;
    }): Promise<{
        clientSecret: string;
        paymentId: string;
    }>;
    getBookingPayments(bookingId: string): Promise<{
        payments: import("../../database/entities/payment.entity").Payment[];
    }>;
    handleStripeWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
        error?: undefined;
    } | {
        error: string;
        received?: undefined;
    }>;
}
export declare class ProviderStripeController {
    private readonly paymentsService;
    private readonly providersService;
    constructor(paymentsService: PaymentsService, providersService: ProvidersService);
    startOnboarding(user: User): Promise<{
        accountId: string;
        accountLinkUrl: string;
    }>;
    getStatus(user: User): Promise<{
        onboarded: boolean;
        accountId: string | null;
        dashboardUrl?: string;
    }>;
    getPayouts(user: User, page?: number, limit?: number): Promise<{
        payouts: import("../../database/entities").ProviderPayout[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
