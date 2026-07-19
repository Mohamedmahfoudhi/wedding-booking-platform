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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const service_entity_1 = require("../../database/entities/service.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const payment_entity_1 = require("../../database/entities/payment.entity");
const review_entity_1 = require("../../database/entities/review.entity");
const category_entity_1 = require("../../database/entities/category.entity");
let AdminService = class AdminService {
    constructor(userRepository, providerRepository, serviceRepository, bookingRepository, paymentRepository, reviewRepository, categoryRepository) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.categoryRepository = categoryRepository;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const [totalUsers, totalProviders, totalServices, totalBookings, pendingServices, pendingProviders, totalRevenueResult, monthlyRevenueResult,] = await Promise.all([
            this.userRepository.count(),
            this.providerRepository.count(),
            this.serviceRepository.count({ where: { status: service_entity_1.ServiceStatus.APPROVED } }),
            this.bookingRepository.count(),
            this.serviceRepository.count({ where: { status: service_entity_1.ServiceStatus.PENDING } }),
            this.providerRepository.count({ where: { isVerified: false } }),
            this.paymentRepository
                .createQueryBuilder('payment')
                .select('SUM(payment.amount)', 'total')
                .where('payment.status = :status', { status: payment_entity_1.PaymentStatus.SUCCEEDED })
                .getRawOne(),
            this.paymentRepository
                .createQueryBuilder('payment')
                .select('SUM(payment.amount)', 'total')
                .where('payment.status = :status', { status: payment_entity_1.PaymentStatus.SUCCEEDED })
                .andWhere('payment.createdAt BETWEEN :start AND :end', {
                start: startOfMonth,
                end: endOfMonth,
            })
                .getRawOne(),
        ]);
        return {
            totalUsers,
            totalProviders,
            totalServices,
            totalBookings,
            pendingServices,
            pendingProviders,
            totalRevenue: Number(totalRevenueResult?.total) || 0,
            monthlyRevenue: Number(monthlyRevenueResult?.total) || 0,
        };
    }
    async getRevenueChart(months = 12) {
        const results = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const result = await this.paymentRepository
                .createQueryBuilder('payment')
                .select('SUM(payment.amount)', 'total')
                .where('payment.status = :status', { status: payment_entity_1.PaymentStatus.SUCCEEDED })
                .andWhere('payment.createdAt BETWEEN :start AND :end', {
                start: startDate,
                end: endDate,
            })
                .getRawOne();
            results.push({
                month: startDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: Number(result?.total) || 0,
            });
        }
        return results;
    }
    async getUsers(page = 1, limit = 10, role, search) {
        const query = this.userRepository.createQueryBuilder('user');
        if (role) {
            query.where('user.role = :role', { role });
        }
        if (search) {
            query.andWhere('(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', { search: `%${search}%` });
        }
        const [users, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC')
            .getManyAndCount();
        return { users, total };
    }
    async updateUser(id, data) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, data);
        return this.userRepository.save(user);
    }
    async deleteUser(id) {
        await this.userRepository.delete(id);
    }
    async getProviders(page = 1, limit = 10, verified, search) {
        const query = this.providerRepository.createQueryBuilder('provider')
            .leftJoinAndSelect('provider.user', 'user');
        if (verified !== undefined) {
            query.where('provider.isVerified = :verified', { verified });
        }
        if (search) {
            query.andWhere('(provider.businessName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
        }
        const [providers, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('provider.createdAt', 'DESC')
            .getManyAndCount();
        return { providers, total };
    }
    async verifyProvider(id, verified) {
        const provider = await this.providerRepository.findOne({ where: { id } });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        provider.isVerified = verified;
        return this.providerRepository.save(provider);
    }
    async featureProvider(id, featured) {
        const provider = await this.providerRepository.findOne({ where: { id } });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        provider.isFeatured = featured;
        return this.providerRepository.save(provider);
    }
    async getServices(page = 1, limit = 10, status, categoryId, categorySlug) {
        const query = this.serviceRepository.createQueryBuilder('service')
            .leftJoinAndSelect('service.provider', 'provider')
            .leftJoinAndSelect('provider.user', 'user')
            .leftJoinAndSelect('service.category', 'category')
            .leftJoinAndSelect('service.images', 'images')
            .leftJoinAndSelect('service.packages', 'packages');
        if (status) {
            query.andWhere('service.status = :status', { status });
        }
        if (categoryId) {
            query.andWhere('service.categoryId = :categoryId', { categoryId });
        }
        if (categorySlug) {
            query.andWhere('category.slug = :categorySlug', { categorySlug });
        }
        const [services, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('service.createdAt', 'DESC')
            .getManyAndCount();
        return { services, total };
    }
    async approveService(id) {
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        service.status = service_entity_1.ServiceStatus.APPROVED;
        service.rejectionReason = '';
        return this.serviceRepository.save(service);
    }
    async rejectService(id, reason) {
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        service.status = service_entity_1.ServiceStatus.REJECTED;
        service.rejectionReason = reason;
        return this.serviceRepository.save(service);
    }
    async featureService(id, featured) {
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        service.isFeatured = featured;
        return this.serviceRepository.save(service);
    }
    async toggleFeatured(id) {
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        service.isFeatured = !service.isFeatured;
        return this.serviceRepository.save(service);
    }
    async deleteService(id) {
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        await this.serviceRepository.remove(service);
    }
    async getReviews(page = 1, limit = 10) {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            relations: ['client', 'service'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { reviews, total };
    }
    async toggleReviewVisibility(id) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        review.isVisible = !review.isVisible;
        return this.reviewRepository.save(review);
    }
    async deleteReview(id) {
        await this.reviewRepository.delete(id);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(3, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(5, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(6, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map