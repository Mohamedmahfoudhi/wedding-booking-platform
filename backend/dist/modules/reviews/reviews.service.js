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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../../database/entities/review.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const service_entity_1 = require("../../database/entities/service.entity");
let ReviewsService = class ReviewsService {
    constructor(reviewRepository, bookingRepository, serviceRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
    }
    async create(clientId, bookingId, createDto) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId, clientId },
            relations: ['service'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== booking_entity_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Can only review completed bookings');
        }
        const existingReview = await this.reviewRepository.findOne({
            where: { bookingId },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('Review already exists for this booking');
        }
        const review = this.reviewRepository.create({
            bookingId,
            serviceId: booking.serviceId,
            clientId,
            rating: createDto.rating,
            comment: createDto.comment,
        });
        await this.reviewRepository.save(review);
        await this.updateServiceRating(booking.serviceId);
        return review;
    }
    async findByService(serviceId, page = 1, limit = 10) {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: { serviceId, isVisible: true },
            relations: ['client'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { reviews, total };
    }
    async findByProvider(providerId, page = 1, limit = 10) {
        const [reviews, total] = await this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.client', 'client')
            .leftJoinAndSelect('review.service', 'service')
            .leftJoin('service.provider', 'provider')
            .where('provider.id = :providerId', { providerId })
            .andWhere('review.isVisible = :isVisible', { isVisible: true })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('review.createdAt', 'DESC')
            .getManyAndCount();
        return { reviews, total };
    }
    async findByClient(clientId, page = 1, limit = 10) {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: { clientId },
            relations: ['service'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { reviews, total };
    }
    async update(id, clientId, updateDto) {
        const review = await this.reviewRepository.findOne({
            where: { id, clientId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        Object.assign(review, updateDto);
        await this.reviewRepository.save(review);
        await this.updateServiceRating(review.serviceId);
        return review;
    }
    async delete(id, clientId) {
        const review = await this.reviewRepository.findOne({
            where: { id, clientId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        const serviceId = review.serviceId;
        await this.reviewRepository.remove(review);
        await this.updateServiceRating(serviceId);
    }
    async respond(reviewId, providerId, response) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['service', 'service.provider'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.service.providerId !== providerId) {
            throw new common_1.ForbiddenException('You cannot respond to this review');
        }
        review.providerResponse = response;
        review.responseDate = new Date();
        return this.reviewRepository.save(review);
    }
    async updateServiceRating(serviceId) {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avgRating')
            .addSelect('COUNT(review.id)', 'reviewCount')
            .where('review.serviceId = :serviceId', { serviceId })
            .andWhere('review.isVisible = :isVisible', { isVisible: true })
            .getRawOne();
        await this.serviceRepository.update(serviceId, {
            avgRating: result.avgRating || 0,
            reviewCount: parseInt(result.reviewCount) || 0,
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map