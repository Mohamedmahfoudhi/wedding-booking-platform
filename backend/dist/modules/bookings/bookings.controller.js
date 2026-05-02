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
exports.ProviderBookingsController = exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const providers_service_1 = require("../providers/providers.service");
let BookingsController = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async create(user, createDto) {
        const booking = await this.bookingsService.create(user.id, createDto);
        return {
            message: 'Booking created successfully',
            booking,
        };
    }
    async findMyBookings(user, page = 1, limit = 10, status) {
        const { bookings, total } = await this.bookingsService.findByClient(user.id, page, limit, status);
        return {
            bookings,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const booking = await this.bookingsService.findById(id);
        return { booking };
    }
    async cancel(user, id, body) {
        const booking = await this.bookingsService.cancel(id, user.id, booking_entity_1.CancelledBy.CLIENT, body.reason);
        return {
            message: 'Booking cancelled successfully',
            booking,
        };
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a booking (Client)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my bookings (Client)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findMyBookings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel booking (Client)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancel", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
let ProviderBookingsController = class ProviderBookingsController {
    constructor(bookingsService, providersService) {
        this.bookingsService = bookingsService;
        this.providersService = providersService;
    }
    async getProviderId(userId) {
        const profile = await this.providersService.findByUserId(userId);
        return profile.id;
    }
    async findAll(user, page = 1, limit = 10, status) {
        const providerId = await this.getProviderId(user.id);
        const { bookings, total } = await this.bookingsService.findByProvider(providerId, page, limit, status);
        return {
            bookings,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getStats(user) {
        const providerId = await this.getProviderId(user.id);
        const stats = await this.bookingsService.getProviderStats(providerId);
        return { stats };
    }
    async getCalendar(user, start, end) {
        const providerId = await this.getProviderId(user.id);
        const events = await this.bookingsService.getCalendarEvents(providerId, new Date(start), new Date(end));
        return { events };
    }
    async createManual(user, createDto) {
        const providerId = await this.getProviderId(user.id);
        const booking = await this.bookingsService.createManual(providerId, createDto);
        return {
            message: 'Booking created successfully',
            booking,
        };
    }
    async findById(id) {
        const booking = await this.bookingsService.findById(id);
        return { booking };
    }
    async confirm(user, id) {
        const providerId = await this.getProviderId(user.id);
        const booking = await this.bookingsService.confirm(id, providerId);
        return {
            message: 'Booking confirmed successfully',
            booking,
        };
    }
    async reject(user, id, body) {
        const providerId = await this.getProviderId(user.id);
        const booking = await this.bookingsService.reject(id, providerId, body.reason);
        return {
            message: 'Booking rejected',
            booking,
        };
    }
    async complete(user, id) {
        const providerId = await this.getProviderId(user.id);
        const booking = await this.bookingsService.complete(id, providerId);
        return {
            message: 'Booking marked as completed',
            booking,
        };
    }
    async markNoShow(user, id) {
        const providerId = await this.getProviderId(user.id);
        const booking = await this.bookingsService.markNoShow(id, providerId);
        return {
            message: 'Booking marked as no-show',
            booking,
        };
    }
};
exports.ProviderBookingsController = ProviderBookingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings (Provider)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object, String]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('calendar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calendar events' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create manual booking (SaaS)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "createManual", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm booking' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject booking' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark booking as completed' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/no-show'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark booking as no-show' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProviderBookingsController.prototype, "markNoShow", null);
exports.ProviderBookingsController = ProviderBookingsController = __decorate([
    (0, swagger_1.ApiTags)('provider/bookings'),
    (0, common_1.Controller)('provider/bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        providers_service_1.ProvidersService])
], ProviderBookingsController);
//# sourceMappingURL=bookings.controller.js.map