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
exports.ProviderServicesController = exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const services_service_1 = require("./services.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const service_filters_dto_1 = require("./dto/service-filters.dto");
const create_package_dto_1 = require("./dto/create-package.dto");
const providers_service_1 = require("../providers/providers.service");
let ServicesController = class ServicesController {
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    async search(filters) {
        const { services, total } = await this.servicesService.search(filters);
        return {
            services,
            meta: {
                page: filters.page || 1,
                limit: filters.limit || 12,
                total,
                totalPages: Math.ceil(total / (filters.limit || 12)),
            },
        };
    }
    async getFeatured(limit = 8) {
        const services = await this.servicesService.getFeatured(limit);
        return { services };
    }
    async findById(id) {
        const service = await this.servicesService.findById(id);
        await this.servicesService.incrementViewCount(id);
        return { service };
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search services with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_filters_dto_1.ServiceFiltersDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "search", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured services' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getFeatured", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "findById", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('services'),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
let ProviderServicesController = class ProviderServicesController {
    constructor(servicesService, providersService) {
        this.servicesService = servicesService;
        this.providersService = providersService;
    }
    async getProviderId(userId) {
        const profile = await this.providersService.findByUserId(userId);
        return profile.id;
    }
    async create(user, createDto) {
        const providerId = await this.getProviderId(user.id);
        const service = await this.servicesService.create(providerId, createDto);
        return {
            message: 'Service created successfully',
            service,
        };
    }
    async findAll(user, page = 1, limit = 10) {
        const providerId = await this.getProviderId(user.id);
        const { services, total } = await this.servicesService.findByProvider(providerId, page, limit);
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
    async findById(user, id) {
        const providerId = await this.getProviderId(user.id);
        const service = await this.servicesService.findByIdForProvider(id, providerId);
        return { service };
    }
    async update(user, id, updateDto) {
        const providerId = await this.getProviderId(user.id);
        const service = await this.servicesService.update(id, providerId, updateDto);
        return {
            message: 'Service updated successfully',
            service,
        };
    }
    async delete(user, id) {
        const providerId = await this.getProviderId(user.id);
        await this.servicesService.delete(id, providerId);
        return { message: 'Service deleted successfully' };
    }
    async addImages(user, id, body) {
        const providerId = await this.getProviderId(user.id);
        const images = await this.servicesService.addImages(id, providerId, body.images);
        return {
            message: 'Images added successfully',
            images,
        };
    }
    async deleteImage(user, id, imageId) {
        const providerId = await this.getProviderId(user.id);
        await this.servicesService.deleteImage(id, imageId, providerId);
        return { message: 'Image deleted successfully' };
    }
    async setPrimaryImage(user, id, imageId) {
        const providerId = await this.getProviderId(user.id);
        await this.servicesService.setPrimaryImage(id, imageId, providerId);
        return { message: 'Primary image updated' };
    }
    async addPackage(user, id, createDto) {
        const providerId = await this.getProviderId(user.id);
        const pkg = await this.servicesService.addPackage(id, providerId, createDto);
        return {
            message: 'Package added successfully',
            package: pkg,
        };
    }
    async updatePackage(user, id, packageId, updateDto) {
        const providerId = await this.getProviderId(user.id);
        const pkg = await this.servicesService.updatePackage(id, packageId, providerId, updateDto);
        return {
            message: 'Package updated successfully',
            package: pkg,
        };
    }
    async deletePackage(user, id, packageId) {
        const providerId = await this.getProviderId(user.id);
        await this.servicesService.deletePackage(id, packageId, providerId);
        return { message: 'Package deleted successfully' };
    }
};
exports.ProviderServicesController = ProviderServicesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all my services' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my service details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete my service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Add images to service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "addImages", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete image from service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('imageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Patch)(':id/images/:imageId/primary'),
    (0, swagger_1.ApiOperation)({ summary: 'Set primary image' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('imageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "setPrimaryImage", null);
__decorate([
    (0, common_1.Post)(':id/packages'),
    (0, swagger_1.ApiOperation)({ summary: 'Add package to service' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, create_package_dto_1.CreatePackageDto]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "addPackage", null);
__decorate([
    (0, common_1.Patch)(':id/packages/:packageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update package' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('packageId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)(':id/packages/:packageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete package' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('packageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], ProviderServicesController.prototype, "deletePackage", null);
exports.ProviderServicesController = ProviderServicesController = __decorate([
    (0, swagger_1.ApiTags)('provider/services'),
    (0, common_1.Controller)('provider/services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PROVIDER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [services_service_1.ServicesService,
        providers_service_1.ProvidersService])
], ProviderServicesController);
//# sourceMappingURL=services.controller.js.map