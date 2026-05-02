"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const stripe_service_1 = require("./stripe.service");
const payment_entity_1 = require("../../database/entities/payment.entity");
const provider_payout_entity_1 = require("../../database/entities/provider-payout.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const providers_module_1 = require("../providers/providers.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([payment_entity_1.Payment, provider_payout_entity_1.ProviderPayout, booking_entity_1.Booking, provider_profile_entity_1.ProviderProfile]),
            providers_module_1.ProvidersModule,
        ],
        controllers: [payments_controller_1.PaymentsController, payments_controller_1.ProviderStripeController],
        providers: [payments_service_1.PaymentsService, stripe_service_1.StripeService],
        exports: [payments_service_1.PaymentsService, stripe_service_1.StripeService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map