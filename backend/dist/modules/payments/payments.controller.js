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
exports.ProviderStripeController = exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const payments_service_1 = require("./payments.service");
const stripe_service_1 = require("./stripe.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const providers_service_1 = require("../providers/providers.service");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, stripeService, configService) {
        this.paymentsService = paymentsService;
        this.stripeService = stripeService;
        this.configService = configService;
    }
    async createPaymentIntent(body) {
        const result = await this.paymentsService.createPaymentIntent(body.bookingId, body.type, body.amount);
        return result;
    }
    async getBookingPayments(bookingId) {
        const payments = await this.paymentsService.getPaymentsByBooking(bookingId);
        return { payments };
    }
    async handleStripeWebhook(req, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
        try {
            const event = this.stripeService.constructWebhookEvent(req.rawBody, signature, webhookSecret);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.paymentsService.handlePaymentSuccess(event.data.object.id);
                    break;
                case 'payment_intent.payment_failed':
                    await this.paymentsService.handlePaymentFailed(event.data.object.id);
                    break;
            }
            return { received: true };
        }
        catch (err) {
            console.error('Webhook error:', err);
            return { error: 'Webhook error' };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment intent for a booking' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get payments for a booking' }),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getBookingPayments", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhook/stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe webhook handler' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleStripeWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        stripe_service_1.StripeService,
        config_1.ConfigService])
], PaymentsController);
let ProviderStripeController = class ProviderStripeController {
    constructor(paymentsService, providersService) {
        this.paymentsService = paymentsService;
        this.providersService = providersService;
    }
    async startOnboarding(user) {
        const profile = await this.providersService.findByUserId(user.id);
        const result = await this.paymentsService.createProviderStripeAccount(profile.id, user.email);
        return result;
    }
    async getStatus(user) {
        const profile = await this.providersService.findByUserId(user.id);
        const status = await this.paymentsService.getProviderStripeStatus(profile.id);
        return status;
    }
    async getPayouts(user, page = 1, limit = 10) {
        const profile = await this.providersService.findByUserId(user.id);
        const { payouts, total } = await this.paymentsService.getProviderPayouts(profile.id, page, limit);
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
};
exports.ProviderStripeController = ProviderStripeController;
__decorate([
    (0, common_1.Post)('onboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Start Stripe Connect onboarding' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProviderStripeController.prototype, "startOnboarding", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe Connect status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProviderStripeController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payout history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderStripeController.prototype, "getPayouts", null);
exports.ProviderStripeController = ProviderStripeController = __decorate([
    (0, swagger_1.ApiTags)('provider/stripe'),
    (0, common_1.Controller)('provider/stripe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        providers_service_1.ProvidersService])
], ProviderStripeController);
//# sourceMappingURL=payments.controller.js.map