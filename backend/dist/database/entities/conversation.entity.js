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
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const provider_profile_entity_1 = require("./provider-profile.entity");
const service_entity_1 = require("./service.entity");
const booking_entity_1 = require("./booking.entity");
const message_entity_1 = require("./message.entity");
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id' }),
    __metadata("design:type", String)
], Conversation.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id' }),
    __metadata("design:type", String)
], Conversation.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_message_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_profile_entity_1.ProviderProfile, (provider) => provider.conversations),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], Conversation.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], Conversation.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], Conversation.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "messages", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations'),
    (0, typeorm_1.Unique)(['clientId', 'providerId'])
], Conversation);
//# sourceMappingURL=conversation.entity.js.map