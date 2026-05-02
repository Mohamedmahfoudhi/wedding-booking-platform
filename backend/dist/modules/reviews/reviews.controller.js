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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reviews_service_1 = require("./reviews.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const create_review_dto_1 = require("./dto/create-review.dto");
const providers_service_1 = require("../providers/providers.service");
let ReviewsController = class ReviewsController {
    constructor(reviewsService, providersService) {
        this.reviewsService = reviewsService;
        this.providersService = providersService;
    }
    async getServiceReviews(serviceId, page = 1, limit = 10) {
        const { reviews, total } = await this.reviewsService.findByService(serviceId, page, limit);
        return {
            reviews,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async create(user, bookingId, createDto) {
        const review = await this.reviewsService.create(user.id, bookingId, createDto);
        return {
            message: 'Review submitted successfully',
            review,
        };
    }
    async getMyReviews(user, page = 1, limit = 10) {
        const { reviews, total } = await this.reviewsService.findByClient(user.id, page, limit);
        return {
            reviews,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async update(user, id, updateDto) {
        const review = await this.reviewsService.update(id, user.id, updateDto);
        return {
            message: 'Review updated successfully',
            review,
        };
    }
    async delete(user, id) {
        await this.reviewsService.delete(id, user.id);
        return { message: 'Review deleted successfully' };
    }
    async getProviderReviews(user, page = 1, limit = 10) {
        const profile = await this.providersService.findByUserId(user.id);
        const { reviews, total } = await this.reviewsService.findByProvider(profile.id, page, limit);
        return {
            reviews,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async respond(user, id, body) {
        const profile = await this.providersService.findByUserId(user.id);
        const review = await this.reviewsService.respond(id, profile.id, body.response);
        return {
            message: 'Response added successfully',
            review,
        };
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('services/:serviceId/reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service reviews' }),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getServiceReviews", null);
__decorate([
    (0, common_1.Post)('bookings/:bookingId/review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a review for a completed booking' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('reviews/my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my reviews' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Patch)('reviews/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update my review' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete my review' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('provider/reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get reviews on my services' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getProviderReviews", null);
__decorate([
    (0, common_1.Post)('provider/reviews/:id/respond'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Respond to a review' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "respond", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('reviews'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService,
        providers_service_1.ProvidersService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map