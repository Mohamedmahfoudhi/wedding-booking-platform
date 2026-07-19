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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderAvailabilityController = exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const availability_service_1 = require("./availability.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let AvailabilityController = class AvailabilityController {
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async getSchedule(serviceId) {
        const schedule = await this.availabilityService.getWeeklySchedule(serviceId);
        return { schedule };
    }
    async getAvailableDates(serviceId, month, year) {
        const dates = await this.availabilityService.getAvailableDates(serviceId, month, year);
        return { dates };
    }
    async getAvailableTimeSlots(serviceId, date) {
        const slots = await this.availabilityService.getAvailableTimeSlots(serviceId, new Date(date));
        return { slots };
    }
    async checkAvailability(serviceId, date, startTime, endTime) {
        const available = await this.availabilityService.checkAvailability(serviceId, new Date(date), startTime, endTime);
        return { available };
    }
    async getPublicBlockedDates(serviceId, start, end) {
        const blockedDates = await this.availabilityService.getBlockedDates(serviceId, start ? new Date(start) : undefined, end ? new Date(end) : undefined);
        return { blockedDates };
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get service availability schedule' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getSchedule", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available dates for a month' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getAvailableDates", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('times'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available time slots for a date' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getAvailableTimeSlots", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if specific date/time is available' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('startTime')),
    __param(3, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "checkAvailability", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('blocked-dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blocked dates for a service (public)' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getPublicBlockedDates", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('availability'),
    (0, common_1.Controller)('services/:serviceId/availability'),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], AvailabilityController);
let ProviderAvailabilityController = class ProviderAvailabilityController {
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async getSchedule(serviceId) {
        const schedule = await this.availabilityService.getWeeklySchedule(serviceId);
        return { schedule };
    }
    async setSchedule(serviceId, body) {
        const schedule = await this.availabilityService.setWeeklySchedule(serviceId, body.schedule);
        return {
            message: 'Schedule updated successfully',
            schedule,
        };
    }
    async getBlockedDates(serviceId, start, end) {
        const blockedDates = await this.availabilityService.getBlockedDates(serviceId, start ? new Date(start) : undefined, end ? new Date(end) : undefined);
        return { blockedDates };
    }
    async blockDates(serviceId, body) {
        const blockedDates = await this.availabilityService.blockDates(serviceId, body.dates.map((d) => ({ date: new Date(d.date), reason: d.reason })));
        return {
            message: 'Dates blocked successfully',
            blockedDates,
        };
    }
    async unblockDate(serviceId, blockedDateId) {
        await this.availabilityService.unblockDate(serviceId, blockedDateId);
        return { message: 'Date unblocked successfully' };
    }
};
exports.ProviderAvailabilityController = ProviderAvailabilityController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get service availability settings' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderAvailabilityController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set weekly schedule' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProviderAvailabilityController.prototype, "setSchedule", null);
__decorate([
    (0, common_1.Get)('blocked-dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blocked dates' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProviderAvailabilityController.prototype, "getBlockedDates", null);
__decorate([
    (0, common_1.Post)('blocked-dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Block dates' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProviderAvailabilityController.prototype, "blockDates", null);
__decorate([
    (0, common_1.Delete)('blocked-dates/:blockedDateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unblock a date' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Param)('blockedDateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProviderAvailabilityController.prototype, "unblockDate", null);
exports.ProviderAvailabilityController = ProviderAvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('provider/availability'),
    (0, common_1.Controller)('provider/services/:serviceId/availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], ProviderAvailabilityController);
//# sourceMappingURL=availability.controller.js.map