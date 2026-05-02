"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_entity_1 = require("../../database/entities/payment.entity");
const provider_payout_entity_1 = require("../../database/entities/provider-payout.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const stripe_service_1 = require("./stripe.service");
let PaymentsService = class PaymentsService {
    constructor(paymentRepository, payoutRepository, bookingRepository, providerRepository, stripeService, configService) {
        this.paymentRepository = paymentRepository;
        this.payoutRepository = payoutRepository;
        this.bookingRepository = bookingRepository;
        this.providerRepository = providerRepository;
        this.stripeService = stripeService;
        this.configService = configService;
    }
    async createPaymentIntent(bookingId, type, amount) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['provider'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        let paymentAmount;
        if (amount) {
            paymentAmount = amount;
        }
        else if (type === payment_entity_1.PaymentType.DEPOSIT && booking.depositAmount) {
            paymentAmount = Number(booking.depositAmount);
        }
        else if (type === payment_entity_1.PaymentType.REMAINING) {
            const paidAmount = await this.getPaidAmount(bookingId);
            paymentAmount = Number(booking.total) - paidAmount;
        }
        else {
            paymentAmount = Number(booking.total);
        }
        const commissionRate = Number(booking.provider.commissionRate) / 100;
        const applicationFee = paymentAmount * commissionRate;
        const paymentIntent = await this.stripeService.createPaymentIntent(paymentAmount, 'TND', {
            bookingId,
            type,
        }, booking.provider.stripeOnboarded ? booking.provider.stripeAccountId : undefined, booking.provider.stripeOnboarded ? applicationFee : undefined);
        const payment = this.paymentRepository.create({
            bookingId,
            stripePaymentId: paymentIntent.id,
            amount: paymentAmount,
            currency: 'TND',
            type,
            status: payment_entity_1.PaymentStatus.PENDING,
        });
        await this.paymentRepository.save(payment);
        return {
            clientSecret: paymentIntent.client_secret || '',
            paymentId: payment.id,
        };
    }
    async handlePaymentSuccess(paymentIntentId) {
        const payment = await this.paymentRepository.findOne({
            where: { stripePaymentId: paymentIntentId },
        });
        if (!payment) {
            return;
        }
        payment.status = payment_entity_1.PaymentStatus.SUCCEEDED;
        await this.paymentRepository.save(payment);
        const booking = await this.bookingRepository.findOne({
            where: { id: payment.bookingId },
        });
        if (booking) {
            if (payment.type === payment_entity_1.PaymentType.DEPOSIT) {
                booking.depositPaid = true;
            }
            const paidAmount = await this.getPaidAmount(booking.id);
            if (paidAmount >= Number(booking.total)) {
                booking.fullyPaid = true;
            }
            await this.bookingRepository.save(booking);
        }
    }
    async handlePaymentFailed(paymentIntentId) {
        const payment = await this.paymentRepository.findOne({
            where: { stripePaymentId: paymentIntentId },
        });
        if (payment) {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            await this.paymentRepository.save(payment);
        }
    }
    async processRefund(paymentId, amount, reason) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('Only successful payments can be refunded');
        }
        if (!payment.stripePaymentId) {
            throw new common_1.BadRequestException('No Stripe payment ID found');
        }
        const refund = await this.stripeService.createRefund(payment.stripePaymentId, amount, reason);
        const refundAmount = amount || Number(payment.amount);
        payment.refundAmount = refundAmount;
        payment.refundReason = reason || '';
        payment.status = refundAmount >= Number(payment.amount)
            ? payment_entity_1.PaymentStatus.REFUNDED
            : payment_entity_1.PaymentStatus.PARTIALLY_REFUNDED;
        return this.paymentRepository.save(payment);
    }
    async getPaymentsByBooking(bookingId) {
        return this.paymentRepository.find({
            where: { bookingId },
            order: { createdAt: 'DESC' },
        });
    }
    async getPaidAmount(bookingId) {
        const result = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.bookingId = :bookingId', { bookingId })
            .andWhere('payment.status = :status', { status: payment_entity_1.PaymentStatus.SUCCEEDED })
            .getRawOne();
        return Number(result.total) || 0;
    }
    async createProviderStripeAccount(providerId, email) {
        const account = await this.stripeService.createConnectAccount(email);
        await this.providerRepository.update(providerId, {
            stripeAccountId: account.id,
            stripeOnboarded: false,
        });
        const frontendUrl = this.configService.get('FRONTEND_URL');
        const accountLink = await this.stripeService.createAccountLink(account.id, `${frontendUrl}/provider/stripe/refresh`, `${frontendUrl}/provider/stripe/complete`);
        return {
            accountId: account.id,
            accountLinkUrl: accountLink.url,
        };
    }
    async getProviderStripeStatus(providerId) {
        const provider = await this.providerRepository.findOne({
            where: { id: providerId },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        if (!provider.stripeAccountId) {
            return { onboarded: false, accountId: null };
        }
        const account = await this.stripeService.getAccount(provider.stripeAccountId);
        if (account.details_submitted && !provider.stripeOnboarded) {
            await this.providerRepository.update(providerId, {
                stripeOnboarded: true,
            });
        }
        let dashboardUrl;
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
    async getProviderPayouts(providerId, page = 1, limit = 10) {
        const [payouts, total] = await this.payoutRepository.findAndCount({
            where: { providerId },
            relations: ['booking'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { payouts, total };
    }
    async createPayout(bookingId, amount, commission) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['provider'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const netAmount = amount - commission;
        const payout = this.payoutRepository.create({
            providerId: booking.providerId,
            bookingId,
            amount,
            commission,
            netAmount,
            status: provider_payout_entity_1.PayoutStatus.PENDING,
        });
        return this.payoutRepository.save(payout);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(provider_payout_entity_1.ProviderPayout)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stripe_service_1.StripeService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map