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
exports.FavoritesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const favorites_service_1 = require("./favorites.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let FavoritesController = class FavoritesController {
    constructor(favoritesService) {
        this.favoritesService = favoritesService;
    }
    async findAll(user, page = 1, limit = 12) {
        const { favorites, total } = await this.favoritesService.findByUser(user.id, page, limit);
        return {
            favorites,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async add(user, serviceId) {
        const favorite = await this.favoritesService.add(user.id, serviceId);
        return {
            message: 'Added to favorites',
            favorite,
        };
    }
    async remove(user, serviceId) {
        await this.favoritesService.remove(user.id, serviceId);
        return { message: 'Removed from favorites' };
    }
    async check(user, serviceId) {
        const isFavorite = await this.favoritesService.isFavorite(user.id, serviceId);
        return { isFavorite };
    }
};
exports.FavoritesController = FavoritesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my favorites' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add to favorites' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)(':serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove from favorites' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':serviceId/check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if service is in favorites' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "check", null);
exports.FavoritesController = FavoritesController = __decorate([
    (0, swagger_1.ApiTags)('favorites'),
    (0, common_1.Controller)('favorites'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [favorites_service_1.FavoritesService])
], FavoritesController);
//# sourceMappingURL=favorites.controller.js.map