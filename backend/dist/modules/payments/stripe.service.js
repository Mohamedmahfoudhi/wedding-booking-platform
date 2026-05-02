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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeService = class StripeService {
    constructor(configService) {
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2023-10-16',
        });
    }
    async createConnectAccount(email) {
        return this.stripe.accounts.create({
            type: 'express',
            email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
    }
    async createAccountLink(accountId, refreshUrl, returnUrl) {
        return this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });
    }
    async getAccount(accountId) {
        return this.stripe.accounts.retrieve(accountId);
    }
    async createLoginLink(accountId) {
        return this.stripe.accounts.createLoginLink(accountId);
    }
    async createPaymentIntent(amount, currency, metadata, connectedAccountId, applicationFeeAmount) {
        const params = {
            amount: Math.round(amount * 1000),
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
    async retrievePaymentIntent(paymentIntentId) {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }
    async createRefund(paymentIntentId, amount, reason) {
        const params = {
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
    async createTransfer(amount, currency, destinationAccountId, metadata) {
        return this.stripe.transfers.create({
            amount: Math.round(amount * 1000),
            currency: currency.toLowerCase(),
            destination: destinationAccountId,
            metadata,
        });
    }
    async getBalance(accountId) {
        const params = {};
        const options = {};
        if (accountId) {
            options.stripeAccount = accountId;
        }
        return this.stripe.balance.retrieve(params, options);
    }
    constructWebhookEvent(payload, signature, webhookSecret) {
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map