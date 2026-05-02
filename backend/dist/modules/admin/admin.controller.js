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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const service_entity_1 = require("../../database/entities/service.entity");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        const stats = await this.adminService.getDashboardStats();
        return { stats };
    }
    async getRevenueChart(months = 12) {
        const data = await this.adminService.getRevenueChart(months);
        return { data };
    }
    async getUsers(page = 1, limit = 10, role, search) {
        const { users, total } = await this.adminService.getUsers(page, limit, role, search);
        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateUser(id, body) {
        const user = await this.adminService.updateUser(id, body);
        return { message: 'User updated', user };
    }
    async deleteUser(id) {
        await this.adminService.deleteUser(id);
        return { message: 'User deleted' };
    }
    async getProviders(page = 1, limit = 10, verified, search) {
        const { providers, total } = await this.adminService.getProviders(page, limit, verified, search);
        return {
            providers,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async verifyProvider(id, body) {
        const provider = await this.adminService.verifyProvider(id, body.verified);
        return { message: 'Provider updated', provider };
    }
    async featureProvider(id, body) {
        const provider = await this.adminService.featureProvider(id, body.featured);
        return { message: 'Provider updated', provider };
    }
    async getServices(page = 1, limit = 10, status, categoryId) {
        const { services, total } = await this.adminService.getServices(page, limit, status, categoryId);
        return {
            services,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async approveService(id) {
        const service = await this.adminService.approveService(id);
        return { message: 'Service approved', service };
    }
    async rejectService(id, body) {
        const service = await this.adminService.rejectService(id, body.reason);
        return { message: 'Service rejected', service };
    }
    async featureService(id, body) {
        const service = await this.adminService.featureService(id, body.featured);
        return { message: 'Service updated', service };
    }
    async getReviews(page = 1, limit = 10) {
        const { reviews, total } = await this.adminService.getReviews(page, limit);
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
    async toggleReviewVisibility(id) {
        const review = await this.adminService.toggleReviewVisibility(id);
        return { message: 'Review updated', review };
    }
    async deleteReview(id) {
        await this.adminService.deleteReview(id);
        return { message: 'Review deleted' };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue chart data' }),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({ summary: 'List all providers' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('verified')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Boolean, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProviders", null);
__decorate([
    (0, common_1.Patch)('providers/:id/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify/unverify provider' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyProvider", null);
__decorate([
    (0, common_1.Patch)('providers/:id/feature'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Feature/unfeature provider' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "featureProvider", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'List all services' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getServices", null);
__decorate([
    (0, common_1.Post)('services/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve service' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveService", null);
__decorate([
    (0, common_1.Post)('services/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject service' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectService", null);
__decorate([
    (0, common_1.Patch)('services/:id/feature'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Feature/unfeature service' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "featureService", null);
__decorate([
    (0, common_1.Get)('reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'List all reviews' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Patch)('reviews/:id/visibility'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle review visibility' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleReviewVisibility", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete review' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteReview", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map