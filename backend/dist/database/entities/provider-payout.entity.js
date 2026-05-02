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
exports.ProviderPayout = exports.PayoutStatus = void 0;
const typeorm_1 = require("typeorm");
const provider_profile_entity_1 = require("./provider-profile.entity");
const booking_entity_1 = require("./booking.entity");
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "pending";
    PayoutStatus["PROCESSING"] = "processing";
    PayoutStatus["COMPLETED"] = "completed";
    PayoutStatus["FAILED"] = "failed";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
let ProviderPayout = class ProviderPayout {
};
exports.ProviderPayout = ProviderPayout;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProviderPayout.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id' }),
    __metadata("design:type", String)
], ProviderPayout.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id' }),
    __metadata("design:type", String)
], ProviderPayout.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_transfer_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], ProviderPayout.prototype, "stripeTransferId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], ProviderPayout.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], ProviderPayout.prototype, "commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], ProviderPayout.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PayoutStatus,
        default: PayoutStatus.PENDING,
    }),
    __metadata("design:type", String)
], ProviderPayout.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProviderPayout.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProviderPayout.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_profile_entity_1.ProviderProfile, (provider) => provider.payouts),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], ProviderPayout.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], ProviderPayout.prototype, "booking", void 0);
exports.ProviderPayout = ProviderPayout = __decorate([
    (0, typeorm_1.Entity)('provider_payouts')
], ProviderPayout);
//# sourceMappingURL=provider-payout.entity.js.map