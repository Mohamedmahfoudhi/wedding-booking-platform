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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const favorite_entity_1 = require("../../database/entities/favorite.entity");
let FavoritesService = class FavoritesService {
    constructor(favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }
    async add(userId, serviceId) {
        const existing = await this.favoriteRepository.findOne({
            where: { userId, serviceId },
        });
        if (existing) {
            throw new common_1.ConflictException('Service already in favorites');
        }
        const favorite = this.favoriteRepository.create({ userId, serviceId });
        return this.favoriteRepository.save(favorite);
    }
    async remove(userId, serviceId) {
        await this.favoriteRepository.delete({ userId, serviceId });
    }
    async findByUser(userId, page = 1, limit = 12) {
        const [favorites, total] = await this.favoriteRepository.findAndCount({
            where: { userId },
            relations: ['service', 'service.images', 'service.provider', 'service.category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { favorites, total };
    }
    async isFavorite(userId, serviceId) {
        const count = await this.favoriteRepository.count({
            where: { userId, serviceId },
        });
        return count > 0;
    }
    async checkFavorites(userId, serviceIds) {
        const favorites = await this.favoriteRepository.find({
            where: serviceIds.map((serviceId) => ({ userId, serviceId })),
        });
        const favoriteSet = new Set(favorites.map((f) => f.serviceId));
        return serviceIds.reduce((acc, id) => {
            acc[id] = favoriteSet.has(id);
            return acc;
        }, {});
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map