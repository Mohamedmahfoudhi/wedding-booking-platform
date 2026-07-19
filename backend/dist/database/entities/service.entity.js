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
exports.Service = exports.ServiceStatus = exports.PriceType = void 0;
const typeorm_1 = require("typeorm");
const provider_profile_entity_1 = require("./provider-profile.entity");
const category_entity_1 = require("./category.entity");
const service_image_entity_1 = require("./service-image.entity");
const service_package_entity_1 = require("./service-package.entity");
const availability_entity_1 = require("./availability.entity");
const blocked_date_entity_1 = require("./blocked-date.entity");
const booking_entity_1 = require("./booking.entity");
const review_entity_1 = require("./review.entity");
const favorite_entity_1 = require("./favorite.entity");
var PriceType;
(function (PriceType) {
    PriceType["FIXED"] = "fixed";
    PriceType["HOURLY"] = "hourly";
    PriceType["DAILY"] = "daily";
    PriceType["CUSTOM"] = "custom";
})(PriceType || (exports.PriceType = PriceType = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["DRAFT"] = "draft";
    ServiceStatus["PENDING"] = "pending";
    ServiceStatus["APPROVED"] = "approved";
    ServiceStatus["REJECTED"] = "rejected";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
let Service = class Service {
};
exports.Service = Service;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Service.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id' }),
    __metadata("design:type", String)
], Service.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], Service.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Service.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'short_description', length: 500, nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "shortDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_price', type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Service.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'price_type',
        type: 'enum',
        enum: PriceType,
        default: PriceType.FIXED,
    }),
    __metadata("design:type", String)
], Service.prototype, "priceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_minutes', nullable: true }),
    __metadata("design:type", Number)
], Service.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'capacity_min', nullable: true }),
    __metadata("design:type", Number)
], Service.prototype, "capacityMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'capacity_max', nullable: true }),
    __metadata("design:type", Number)
], Service.prototype, "capacityMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Service.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], Service.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ServiceStatus,
        default: ServiceStatus.PENDING,
    }),
    __metadata("design:type", String)
], Service.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avg_rating', type: 'decimal', precision: 2, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], Service.prototype, "avgRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_count', default: 0 }),
    __metadata("design:type", Number)
], Service.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_count', default: 0 }),
    __metadata("design:type", Number)
], Service.prototype, "bookingCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'view_count', default: 0 }),
    __metadata("design:type", Number)
], Service.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Service.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Service.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_profile_entity_1.ProviderProfile, (provider) => provider.services, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], Service.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.services),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Service.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_image_entity_1.ServiceImage, (image) => image.service, { cascade: true }),
    __metadata("design:type", Array)
], Service.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_package_entity_1.ServicePackage, (pkg) => pkg.service, { cascade: true }),
    __metadata("design:type", Array)
], Service.prototype, "packages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => availability_entity_1.Availability, (availability) => availability.service, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Service.prototype, "availability", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => blocked_date_entity_1.BlockedDate, (blockedDate) => blockedDate.service, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Service.prototype, "blockedDates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.service),
    __metadata("design:type", Array)
], Service.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.service),
    __metadata("design:type", Array)
], Service.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => favorite_entity_1.Favorite, (favorite) => favorite.service),
    __metadata("design:type", Array)
], Service.prototype, "favorites", void 0);
exports.Service = Service = __decorate([
    (0, typeorm_1.Entity)('services')
], Service);
//# sourceMappingURL=service.entity.js.map