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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const provider_profile_entity_1 = require("./provider-profile.entity");
const booking_entity_1 = require("./booking.entity");
const review_entity_1 = require("./review.entity");
const favorite_entity_1 = require("./favorite.entity");
const message_entity_1 = require("./message.entity");
const notification_entity_1 = require("./notification.entity");
const refresh_token_entity_1 = require("./refresh-token.entity");
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["PROVIDER"] = "provider";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
    get fullName() {
        return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verification_token', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "verificationToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reset_password_token', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reset_password_expires', type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordExpires", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => provider_profile_entity_1.ProviderProfile, (profile) => profile.user),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], User.prototype, "providerProfile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.client),
    __metadata("design:type", Array)
], User.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.client),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => favorite_entity_1.Favorite, (favorite) => favorite.user),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.sender),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => refresh_token_entity_1.RefreshToken, (token) => token.user),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map