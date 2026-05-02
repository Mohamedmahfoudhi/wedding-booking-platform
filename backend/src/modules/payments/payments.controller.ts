import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  RawBodyRequest,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { PaymentType } from '../../database/entities/payment.entity';
import { ProvidersService } from '../providers/providers.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent for a booking' })
  async createPaymentIntent(
    @Body() body: { bookingId: string; type: PaymentType; amount?: number },
  ) {
    const result = await this.paymentsService.createPaymentIntent(
      body.bookingId,
      body.type,
      body.amount,
    );
    return result;
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments for a booking' })
  async getBookingPayments(@Param('bookingId') bookingId: string) {
    const payments = await this.paymentsService.getPaymentsByBooking(bookingId);
    return { payments };
  }

  @Public()
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';

    try {
      const event = this.stripeService.constructWebhookEvent(
        req.rawBody as Buffer,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.paymentsService.handlePaymentSuccess(
            (event.data.object as { id: string }).id,
          );
          break;
        case 'payment_intent.payment_failed':
          await this.paymentsService.handlePaymentFailed(
            (event.data.object as { id: string }).id,
          );
          break;
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook error:', err);
      return { error: 'Webhook error' };
    }
  }
}

@ApiTags('provider/stripe')
@Controller('provider/stripe')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth()
export class ProviderStripeController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly providersService: ProvidersService,
  ) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Start Stripe Connect onboarding' })
  async startOnboarding(@CurrentUser() user: User) {
    const profile = await this.providersService.findByUserId(user.id);
    const result = await this.paymentsService.createProviderStripeAccount(
      profile.id,
      user.email,
    );
    return result;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Stripe Connect status' })
  async getStatus(@CurrentUser() user: User) {
    const profile = await this.providersService.findByUserId(user.id);
    const status = await this.paymentsService.getProviderStripeStatus(profile.id);
    return status;
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Get payout history' })
  async getPayouts(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const profile = await this.providersService.findByUserId(user.id);
    const { payouts, total } = await this.paymentsService.getProviderPayouts(
      profile.id,
      page,
      limit,
    );

    return {
      payouts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
