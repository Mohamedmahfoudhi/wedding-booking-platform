import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private readonly configService;
    private stripe;
    constructor(configService: ConfigService);
    createConnectAccount(email: string): Promise<Stripe.Account>;
    createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<Stripe.AccountLink>;
    getAccount(accountId: string): Promise<Stripe.Account>;
    createLoginLink(accountId: string): Promise<Stripe.LoginLink>;
    createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>, connectedAccountId?: string, applicationFeeAmount?: number): Promise<Stripe.PaymentIntent>;
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund>;
    createTransfer(amount: number, currency: string, destinationAccountId: string, metadata: Record<string, string>): Promise<Stripe.Transfer>;
    getBalance(accountId?: string): Promise<Stripe.Balance>;
    constructWebhookEvent(payload: Buffer, signature: string, webhookSecret: string): Stripe.Event;
}
