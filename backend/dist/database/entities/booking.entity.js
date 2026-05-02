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
exports.Booking = exports.CancelledBy = exports.BookingStatus = exports.BookingSource = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const provider_profile_entity_1 = require("./provider-profile.entity");
const service_entity_1 = require("./service.entity");
const service_package_entity_1 = require("./service-package.entity");
const payment_entity_1 = require("./payment.entity");
const review_entity_1 = require("./review.entity");
var BookingSource;
(function (BookingSource) {
    BookingSource["MARKETPLACE"] = "marketplace";
    BookingSource["SAAS"] = "saas";
})(BookingSource || (exports.BookingSource = BookingSource = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["IN_PROGRESS"] = "in_progress";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var CancelledBy;
(function (CancelledBy) {
    CancelledBy["CLIENT"] = "client";
    CancelledBy["PROVIDER"] = "provider";
    CancelledBy["ADMIN"] = "admin";
})(CancelledBy || (exports.CancelledBy = CancelledBy = {}));
let Booking = class Booking {
};
exports.Booking = Booking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_number', unique: true, length: 20 }),
    __metadata("design:type", String)
], Booking.prototype, "bookingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id' }),
    __metadata("design:type", String)
], Booking.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id' }),
    __metadata("design:type", String)
], Booking.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id' }),
    __metadata("design:type", String)
], Booking.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_date', type: 'date' }),
    __metadata("design:type", Date)
], Booking.prototype, "eventDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'guest_count', nullable: true }),
    __metadata("design:type", Number)
], Booking.prototype, "guestCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BookingSource,
        default: BookingSource.MARKETPLACE,
    }),
    __metadata("design:type", String)
], Booking.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Booking.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Booking.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Booking.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Booking.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deposit_paid', default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "depositPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fully_paid', default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "fullyPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_name', length: 200, nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_email', length: 255, nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "clientEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "clientPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'cancelled_by',
        type: 'enum',
        enum: CancelledBy,
        nullable: true,
    }),
    __metadata("design:type", String)
], Booking.prototype, "cancelledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancellation_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Booking.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Booking.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.bookings),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], Booking.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_package_entity_1.ServicePackage, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", service_package_entity_1.ServicePackage)
], Booking.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.bookings),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], Booking.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_profile_entity_1.ProviderProfile, (provider) => provider.bookings),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], Booking.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.booking),
    __metadata("design:type", Array)
], Booking.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => review_entity_1.Review, (review) => review.booking),
    __metadata("design:type", review_entity_1.Review)
], Booking.prototype, "review", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Entity)('bookings')
], Booking);
//# sourceMappingURL=booking.entity.js.map