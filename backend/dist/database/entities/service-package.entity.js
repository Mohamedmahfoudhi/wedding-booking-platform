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
exports.ServicePackage = void 0;
const typeorm_1 = require("typeorm");
const service_entity_1 = require("./service.entity");
let ServicePackage = class ServicePackage {
};
exports.ServicePackage = ServicePackage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServicePackage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_id' }),
    __metadata("design:type", String)
], ServicePackage.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], ServicePackage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ServicePackage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], ServicePackage.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], ServicePackage.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_popular', default: false }),
    __metadata("design:type", Boolean)
], ServicePackage.prototype, "isPopular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', default: 0 }),
    __metadata("design:type", Number)
], ServicePackage.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ServicePackage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.packages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], ServicePackage.prototype, "service", void 0);
exports.ServicePackage = ServicePackage = __decorate([
    (0, typeorm_1.Entity)('service_packages')
], ServicePackage);
//# sourceMappingURL=service-package.entity.js.map