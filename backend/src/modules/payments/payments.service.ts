import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus, PaymentType } from '../../database/entities/payment.entity';
import { ProviderPayout, PayoutStatus } from '../../database/entities/provider-payout.entity';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(ProviderPayout)
    private readonly payoutRepository: Repository<ProviderPayout>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ProviderProfile)
    private readonly providerRepository: Repository<ProviderProfile>,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentIntent(
    bookingId: string,
    type: PaymentType,
    amount?: number,
  ): Promise<{ clientSecret: string; paymentId: string }> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['provider'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Calculate amount
    let paymentAmount: number;
    if (amount) {
      paymentAmount = amount;
    } else if (type === PaymentType.DEPOSIT && booking.depositAmount) {
      paymentAmount = Number(booking.depositAmount);
    } else if (type === PaymentType.REMAINING) {
      const paidAmount = await this.getPaidAmount(bookingId);
      paymentAmount = Number(booking.total) - paidAmount;
    } else {
      paymentAmount = Number(booking.total);
    }

    // Calculate commission
    const commissionRate = Number(booking.provider.commissionRate) / 100;
    const applicationFee = paymentAmount * commissionRate;

    // Create Stripe payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      paymentAmount,
      'TND',
      {
        bookingId,
        type,
      },
      booking.provider.stripeOnboarded ? booking.provider.stripeAccountId : undefined,
      booking.provider.stripeOnboarded ? applicationFee : undefined,
    );

    // Create payment record
    const payment = this.paymentRepository.create({
      bookingId,
      stripePaymentId: paymentIntent.id,
      amount: paymentAmount,
      currency: 'TND',
      type,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    return {
      clientSecret: paymentIntent.client_secret || '',
      paymentId: payment.id,
    };
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!payment) {
      return;
    }

    payment.status = PaymentStatus.SUCCEEDED;
    await this.paymentRepository.save(payment);

    // Update booking payment status
    const booking = await this.bookingRepository.findOne({
      where: { id: payment.bookingId },
    });

    if (booking) {
      if (payment.type === PaymentType.DEPOSIT) {
        booking.depositPaid = true;
      }

      const paidAmount = await this.getPaidAmount(booking.id);
      if (paidAmount >= Number(booking.total)) {
        booking.fullyPaid = true;
      }

      await this.bookingRepository.save(booking);
    }
  }

  async handlePaymentFailed(paymentIntentId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentId: paymentIntentId },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
    }
  }

  async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (!payment.stripePaymentId) {
      throw new BadRequestException('No Stripe payment ID found');
    }

    const refund = await this.stripeService.createRefund(
      payment.stripePaymentId,
      amount,
      reason,
    );

    const refundAmount = amount || Number(payment.amount);
    payment.refundAmount = refundAmount;
    payment.refundReason = reason || '';
    payment.status = refundAmount >= Number(payment.amount)
      ? PaymentStatus.REFUNDED
      : PaymentStatus.PARTIALLY_REFUNDED;

    return this.paymentRepository.save(payment);
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaidAmount(bookingId: string): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.bookingId = :bookingId', { bookingId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
      .getRawOne();

    return Number(result.total) || 0;
  }

  // Provider Stripe Connect
  async createProviderStripeAccount(
    providerId: string,
    email: string,
  ): Promise<{ accountId: string; accountLinkUrl: string }> {
    const account = await this.stripeService.createConnectAccount(email);

    await this.providerRepository.update(providerId, {
      stripeAccountId: account.id,
      stripeOnboarded: false,
    });

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const accountLink = await this.stripeService.createAccountLink(
      account.id,
      `${frontendUrl}/provider/stripe/refresh`,
      `${frontendUrl}/provider/stripe/complete`,
    );

    return {
      accountId: account.id,
      accountLinkUrl: accountLink.url,
    };
  }

  async getProviderStripeStatus(providerId: string): Promise<{
    onboarded: boolean;
    accountId: string | null;
    dashboardUrl?: string;
  }> {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (!provider.stripeAccountId) {
      return { onboarded: false, accountId: null };
    }

    const account = await this.stripeService.getAccount(provider.stripeAccountId);

    // Update onboarded status
    if (account.details_submitted && !provider.stripeOnboarded) {
      await this.providerRepository.update(providerId, {
        stripeOnboarded: true,
      });
    }

    let dashboardUrl: string | undefined;
    if (account.details_submitted) {
      const loginLink = await this.stripeService.createLoginLink(provider.stripeAccountId);
      dashboardUrl = loginLink.url;
    }

    return {
      onboarded: account.details_submitted || false,
      accountId: provider.stripeAccountId,
      dashboardUrl,
    };
  }

  // Payouts
  async getProviderPayouts(
    providerId: string,
    page = 1,
    limit = 10,
  ): Promise<{ payouts: ProviderPayout[]; total: number }> {
    const [payouts, total] = await this.payoutRepository.findAndCount({
      where: { providerId },
      relations: ['booking'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { payouts, total };
  }

  async createPayout(
    bookingId: string,
    amount: number,
    commission: number,
  ): Promise<ProviderPayout> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['provider'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const netAmount = amount - commission;

    const payout = this.payoutRepository.create({
      providerId: booking.providerId,
      bookingId,
      amount,
      commission,
      netAmount,
      status: PayoutStatus.PENDING,
    });

    return this.payoutRepository.save(payout);
  }
}
