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
exports.Availability = void 0;
const typeorm_1 = require("typeorm");
const service_entity_1 = require("./service.entity");
let Availability = class Availability {
};
exports.Availability = Availability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Availability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id' }),
    __metadata("design:type", String)
], Availability.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_of_week' }),
    __metadata("design:type", Number)
], Availability.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], Availability.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], Availability.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], Availability.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.availability, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], Availability.prototype, "service", void 0);
exports.Availability = Availability = __decorate([
    (0, typeorm_1.Entity)('availability')
], Availability);
//# sourceMappingURL=availability.entity.js.map