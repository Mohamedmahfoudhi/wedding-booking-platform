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
exports.ProvidersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const providers_service_1 = require("./providers.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const create_provider_dto_1 = require("./dto/create-provider.dto");
const update_provider_dto_1 = require("./dto/update-provider.dto");
let ProvidersController = class ProvidersController {
    constructor(providersService) {
        this.providersService = providersService;
    }
    async register(user, createDto) {
        const profile = await this.providersService.createProfile(user.id, createDto);
        return {
            message: 'Provider profile created successfully',
            profile,
        };
    }
    async getProfile(user) {
        const profile = await this.providersService.findByUserId(user.id);
        return { profile };
    }
    async updateProfile(user, updateDto) {
        const profile = await this.providersService.updateProfile(user.id, updateDto);
        return {
            message: 'Profile updated successfully',
            profile,
        };
    }
    async getDashboardStats(user) {
        const profile = await this.providersService.findByUserId(user.id);
        const stats = await this.providersService.getDashboardStats(profile.id);
        return { stats };
    }
    async findAll(page = 1, limit = 10, city, governorate, verified, featured) {
        const { providers, total } = await this.providersService.findAll(page, limit, { city, governorate, isVerified: verified, isFeatured: featured });
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
    async findBySlug(slug) {
        const provider = await this.providersService.findBySlug(slug);
        return { provider };
    }
};
exports.ProvidersController = ProvidersController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register as a provider' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_provider_dto_1.CreateProviderDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get own provider profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update own provider profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        update_provider_dto_1.UpdateProviderDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider dashboard statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getDashboardStats", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all providers' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('city')),
    __param(3, (0, common_1.Query)('governorate')),
    __param(4, (0, common_1.Query)('verified')),
    __param(5, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findBySlug", null);
exports.ProvidersController = ProvidersController = __decorate([
    (0, swagger_1.ApiTags)('providers'),
    (0, common_1.Controller)('providers'),
    __metadata("design:paramtypes", [providers_service_1.ProvidersService])
], ProvidersController);
//# sourceMappingURL=providers.controller.js.map