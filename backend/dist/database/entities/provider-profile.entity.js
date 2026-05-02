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
exports.ProviderProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const service_entity_1 = require("./service.entity");
const booking_entity_1 = require("./booking.entity");
const conversation_entity_1 = require("./conversation.entity");
const provider_payout_entity_1 = require("./provider-payout.entity");
let ProviderProfile = class ProviderProfile {
};
exports.ProviderProfile = ProviderProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProviderProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', unique: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_name', length: 200 }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 200 }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cover_image', length: 500, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "governorate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], ProviderProfile.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], ProviderProfile.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_account_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "stripeAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_onboarded', default: false }),
    __metadata("design:type", Boolean)
], ProviderProfile.prototype, "stripeOnboarded", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'commission_rate',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 10.0,
    }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "commissionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_revenue', type: 'decimal', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "totalRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_bookings', default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "totalBookings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avg_rating', type: 'decimal', precision: 2, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "avgRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_count', default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProviderProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProviderProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.providerProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ProviderProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_entity_1.Service, (service) => service.provider),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "services", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.provider),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conversation) => conversation.provider),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "conversations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => provider_payout_entity_1.ProviderPayout, (payout) => payout.provider),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "payouts", void 0);
exports.ProviderProfile = ProviderProfile = __decorate([
    (0, typeorm_1.Entity)('provider_profiles')
], ProviderProfile);
//# sourceMappingURL=provider-profile.entity.js.map