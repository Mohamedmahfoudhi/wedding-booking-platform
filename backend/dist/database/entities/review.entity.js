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
exports.Review = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const service_entity_1 = require("./service.entity");
const booking_entity_1 = require("./booking.entity");
let Review = class Review {
};
exports.Review = Review;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Review.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', unique: true }),
    __metadata("design:type", String)
], Review.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id' }),
    __metadata("design:type", String)
], Review.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id' }),
    __metadata("design:type", String)
], Review.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_response', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "providerResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Review.prototype, "responseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_visible', default: true }),
    __metadata("design:type", Boolean)
], Review.prototype, "isVisible", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Review.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => booking_entity_1.Booking, (booking) => booking.review),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], Review.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.reviews),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], Review.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.reviews),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "client", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)('reviews')
], Review);
//# sourceMappingURL=review.entity.js.map