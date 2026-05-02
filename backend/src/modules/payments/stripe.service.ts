import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createConnectAccount(email: string): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  async getAccount(accountId: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(accountId);
  }

  async createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
    return this.stripe.accounts.createLoginLink(accountId);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
    connectedAccountId?: string,
    applicationFeeAmount?: number,
  ): Promise<Stripe.PaymentIntent> {
    const params: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 1000), // Convert to millimes (TND)
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    if (connectedAccountId && applicationFeeAmount) {
      params.application_fee_amount = Math.round(applicationFeeAmount * 1000);
      params.transfer_data = {
        destination: connectedAccountId,
      };
    }

    return this.stripe.paymentIntents.create(params);
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      params.amount = Math.round(amount * 1000);
    }

    if (reason) {
      params.reason = 'requested_by_customer';
    }

    return this.stripe.refunds.create(params);
  }

  async createTransfer(
    amount: number,
    currency: string,
    destinationAccountId: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create({
      amount: Math.round(amount * 1000),
      currency: currency.toLowerCase(),
      destination: destinationAccountId,
      metadata,
    });
  }

  async getBalance(accountId?: string): Promise<Stripe.Balance> {
    const params: Stripe.BalanceRetrieveParams = {};
    const options: Stripe.RequestOptions = {};

    if (accountId) {
      options.stripeAccount = accountId;
    }

    return this.stripe.balance.retrieve(params, options);
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
