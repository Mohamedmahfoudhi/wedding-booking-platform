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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slugify_1 = require("slugify");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let ProvidersService = class ProvidersService {
    constructor(providerRepository, userRepository) {
        this.providerRepository = providerRepository;
        this.userRepository = userRepository;
    }
    async createProfile(userId, createDto) {
        const existingProfile = await this.providerRepository.findOne({
            where: { userId },
        });
        if (existingProfile) {
            throw new common_1.ConflictException('Provider profile already exists');
        }
        let slug = (0, slugify_1.default)(createDto.businessName, { lower: true, strict: true });
        const existingSlug = await this.providerRepository.findOne({
            where: { slug },
        });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }
        const profile = this.providerRepository.create({
            userId,
            ...createDto,
            slug,
        });
        await this.providerRepository.save(profile);
        await this.userRepository.update(userId, { role: user_entity_1.UserRole.PROVIDER });
        return profile;
    }
    async findByUserId(userId) {
        const profile = await this.providerRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        return profile;
    }
    async findBySlug(slug) {
        const profile = await this.providerRepository.findOne({
            where: { slug },
            relations: ['user', 'services'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider not found');
        }
        return profile;
    }
    async findById(id) {
        const profile = await this.providerRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        return profile;
    }
    async updateProfile(userId, updateDto) {
        const profile = await this.findByUserId(userId);
        if (updateDto.businessName && updateDto.businessName !== profile.businessName) {
            let slug = (0, slugify_1.default)(updateDto.businessName, { lower: true, strict: true });
            const existingSlug = await this.providerRepository.findOne({
                where: { slug },
            });
            if (existingSlug && existingSlug.id !== profile.id) {
                slug = `${slug}-${Date.now()}`;
            }
            updateDto.slug = slug;
        }
        Object.assign(profile, updateDto);
        return this.providerRepository.save(profile);
    }
    async findAll(page = 1, limit = 10, filters) {
        const query = this.providerRepository.createQueryBuilder('provider')
            .leftJoinAndSelect('provider.user', 'user')
            .where('user.isActive = :isActive', { isActive: true });
        if (filters?.city) {
            query.andWhere('provider.city = :city', { city: filters.city });
        }
        if (filters?.governorate) {
            query.andWhere('provider.governorate = :governorate', {
                governorate: filters.governorate,
            });
        }
        if (filters?.isVerified !== undefined) {
            query.andWhere('provider.isVerified = :isVerified', {
                isVerified: filters.isVerified,
            });
        }
        if (filters?.isFeatured !== undefined) {
            query.andWhere('provider.isFeatured = :isFeatured', {
                isFeatured: filters.isFeatured,
            });
        }
        const [providers, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('provider.createdAt', 'DESC')
            .getManyAndCount();
        return { providers, total };
    }
    async verifyProvider(providerId) {
        const profile = await this.findById(providerId);
        profile.isVerified = true;
        return this.providerRepository.save(profile);
    }
    async featureProvider(providerId, featured) {
        const profile = await this.findById(providerId);
        profile.isFeatured = featured;
        return this.providerRepository.save(profile);
    }
    async updateStripeAccount(providerId, stripeAccountId, onboarded) {
        await this.providerRepository.update(providerId, {
            stripeAccountId,
            stripeOnboarded: onboarded,
        });
    }
    async getDashboardStats(providerId) {
        const profile = await this.findById(providerId);
        return {
            totalBookings: profile.totalBookings,
            totalRevenue: Number(profile.totalRevenue),
            avgRating: Number(profile.avgRating),
            reviewCount: profile.reviewCount,
        };
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map