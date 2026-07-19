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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slugify_1 = require("slugify");
const service_entity_1 = require("../../database/entities/service.entity");
const service_image_entity_1 = require("../../database/entities/service-image.entity");
const service_package_entity_1 = require("../../database/entities/service-package.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
let ServicesService = class ServicesService {
    constructor(serviceRepository, imageRepository, packageRepository, providerRepository) {
        this.serviceRepository = serviceRepository;
        this.imageRepository = imageRepository;
        this.packageRepository = packageRepository;
        this.providerRepository = providerRepository;
    }
    async create(providerId, createDto) {
        let slug = (0, slugify_1.default)(createDto.name, { lower: true, strict: true });
        const existingSlug = await this.serviceRepository.findOne({
            where: { slug, providerId },
        });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }
        const { images, packages, ...serviceData } = createDto;
        const service = this.serviceRepository.create({
            ...serviceData,
            providerId,
            slug,
            status: service_entity_1.ServiceStatus.PENDING,
        });
        const savedService = await this.serviceRepository.save(service);
        if (images && images.length > 0) {
            const imageEntities = images.map((img, index) => this.imageRepository.create({
                serviceId: savedService.id,
                url: img.url,
                isPrimary: index === 0,
                displayOrder: index,
            }));
            await this.imageRepository.save(imageEntities);
        }
        if (packages && packages.length > 0) {
            const packageEntities = packages.map((pkg, index) => this.packageRepository.create({
                serviceId: savedService.id,
                name: pkg.name,
                description: pkg.description || '',
                price: pkg.price,
                displayOrder: index,
            }));
            await this.packageRepository.save(packageEntities);
        }
        return this.findById(savedService.id);
    }
    async findById(id) {
        const service = await this.serviceRepository.findOne({
            where: { id },
            relations: ['provider', 'provider.user', 'category', 'images', 'packages'],
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        return service;
    }
    async findByIdForProvider(id, providerId) {
        const service = await this.findById(id);
        if (service.providerId !== providerId) {
            throw new common_1.ForbiddenException('You do not have access to this service');
        }
        return service;
    }
    async update(id, providerId, updateDto) {
        const service = await this.findByIdForProvider(id, providerId);
        const { images, packages, ...serviceData } = updateDto;
        if (serviceData.name && serviceData.name !== service.name) {
            let slug = (0, slugify_1.default)(serviceData.name, { lower: true, strict: true });
            const existingSlug = await this.serviceRepository.findOne({
                where: { slug, providerId },
            });
            if (existingSlug && existingSlug.id !== id) {
                slug = `${slug}-${Date.now()}`;
            }
            serviceData.slug = slug;
        }
        Object.assign(service, serviceData);
        const savedService = await this.serviceRepository.save(service);
        if (images !== undefined) {
            await this.imageRepository.delete({ serviceId: id });
            if (images.length > 0) {
                const imageEntities = images.map((img, index) => this.imageRepository.create({
                    serviceId: id,
                    url: img.url,
                    isPrimary: index === 0,
                    displayOrder: index,
                }));
                await this.imageRepository.save(imageEntities);
            }
        }
        if (packages !== undefined) {
            await this.packageRepository.delete({ serviceId: id });
            if (packages.length > 0) {
                const packageEntities = packages.map((pkg, index) => this.packageRepository.create({
                    serviceId: id,
                    name: pkg.name,
                    description: pkg.description || '',
                    price: pkg.price,
                    displayOrder: index,
                }));
                await this.packageRepository.save(packageEntities);
            }
        }
        return this.findById(id);
    }
    async delete(id, providerId) {
        const service = await this.findByIdForProvider(id, providerId);
        await this.serviceRepository.remove(service);
    }
    async findByProvider(providerId, page = 1, limit = 10) {
        const [services, total] = await this.serviceRepository.findAndCount({
            where: { providerId },
            relations: ['category', 'images'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { services, total };
    }
    async search(filters) {
        const query = this.serviceRepository.createQueryBuilder('service')
            .leftJoinAndSelect('service.provider', 'provider')
            .leftJoinAndSelect('provider.user', 'user')
            .leftJoinAndSelect('service.category', 'category')
            .leftJoinAndSelect('service.images', 'images')
            .where('service.status = :status', { status: service_entity_1.ServiceStatus.APPROVED })
            .andWhere('service.isActive = :isActive', { isActive: true });
        if (filters.category) {
            query.andWhere('category.slug = :categorySlug', {
                categorySlug: filters.category,
            });
        }
        if (filters.city) {
            query.andWhere('provider.city = :city', { city: filters.city });
        }
        if (filters.governorate) {
            query.andWhere('provider.governorate = :governorate', {
                governorate: filters.governorate,
            });
        }
        if (filters.priceMin !== undefined) {
            query.andWhere('service.basePrice >= :priceMin', {
                priceMin: filters.priceMin,
            });
        }
        if (filters.priceMax !== undefined) {
            query.andWhere('service.basePrice <= :priceMax', {
                priceMax: filters.priceMax,
            });
        }
        if (filters.ratingMin !== undefined) {
            query.andWhere('service.avgRating >= :ratingMin', {
                ratingMin: filters.ratingMin,
            });
        }
        if (filters.capacity !== undefined) {
            query.andWhere('(service.capacityMin IS NULL OR service.capacityMin <= :capacity)', { capacity: filters.capacity });
            query.andWhere('(service.capacityMax IS NULL OR service.capacityMax >= :capacity)', { capacity: filters.capacity });
        }
        if (filters.featured) {
            query.andWhere('service.isFeatured = :isFeatured', { isFeatured: true });
        }
        const sortField = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
        switch (sortField) {
            case 'price':
                query.orderBy('service.basePrice', sortOrder);
                break;
            case 'rating':
                query.orderBy('service.avgRating', sortOrder);
                break;
            case 'reviews':
                query.orderBy('service.reviewCount', sortOrder);
                break;
            default:
                query.orderBy('service.createdAt', sortOrder);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 12;
        const [services, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { services, total };
    }
    async getFeatured(limit = 8) {
        return this.serviceRepository.find({
            where: {
                status: service_entity_1.ServiceStatus.APPROVED,
                isActive: true,
                isFeatured: true,
            },
            relations: ['provider', 'category', 'images'],
            take: limit,
            order: { createdAt: 'DESC' },
        });
    }
    async addImages(serviceId, providerId, images) {
        await this.findByIdForProvider(serviceId, providerId);
        const existingImages = await this.imageRepository.count({
            where: { serviceId },
        });
        const newImages = images.map((img, index) => this.imageRepository.create({
            serviceId,
            url: img.url,
            publicId: img.publicId,
            displayOrder: existingImages + index,
            isPrimary: existingImages === 0 && index === 0,
        }));
        return this.imageRepository.save(newImages);
    }
    async deleteImage(serviceId, imageId, providerId) {
        await this.findByIdForProvider(serviceId, providerId);
        const image = await this.imageRepository.findOne({
            where: { id: imageId, serviceId },
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        await this.imageRepository.remove(image);
    }
    async setPrimaryImage(serviceId, imageId, providerId) {
        await this.findByIdForProvider(serviceId, providerId);
        await this.imageRepository.update({ serviceId }, { isPrimary: false });
        await this.imageRepository.update({ id: imageId, serviceId }, { isPrimary: true });
    }
    async addPackage(serviceId, providerId, createDto) {
        await this.findByIdForProvider(serviceId, providerId);
        const existingPackages = await this.packageRepository.count({
            where: { serviceId },
        });
        const pkg = this.packageRepository.create({
            ...createDto,
            serviceId,
            displayOrder: existingPackages,
        });
        return this.packageRepository.save(pkg);
    }
    async updatePackage(serviceId, packageId, providerId, updateDto) {
        await this.findByIdForProvider(serviceId, providerId);
        const pkg = await this.packageRepository.findOne({
            where: { id: packageId, serviceId },
        });
        if (!pkg) {
            throw new common_1.NotFoundException('Package not found');
        }
        Object.assign(pkg, updateDto);
        return this.packageRepository.save(pkg);
    }
    async deletePackage(serviceId, packageId, providerId) {
        await this.findByIdForProvider(serviceId, providerId);
        const pkg = await this.packageRepository.findOne({
            where: { id: packageId, serviceId },
        });
        if (!pkg) {
            throw new common_1.NotFoundException('Package not found');
        }
        await this.packageRepository.remove(pkg);
    }
    async approveService(id) {
        const service = await this.findById(id);
        service.status = service_entity_1.ServiceStatus.APPROVED;
        service.rejectionReason = '';
        return this.serviceRepository.save(service);
    }
    async rejectService(id, reason) {
        const service = await this.findById(id);
        service.status = service_entity_1.ServiceStatus.REJECTED;
        service.rejectionReason = reason;
        return this.serviceRepository.save(service);
    }
    async featureService(id, featured) {
        const service = await this.findById(id);
        service.isFeatured = featured;
        return this.serviceRepository.save(service);
    }
    async incrementViewCount(id) {
        await this.serviceRepository.increment({ id }, 'viewCount', 1);
    }
    async updateRating(serviceId) {
        const result = await this.serviceRepository
            .createQueryBuilder('service')
            .leftJoin('service.reviews', 'review')
            .select('AVG(review.rating)', 'avgRating')
            .addSelect('COUNT(review.id)', 'reviewCount')
            .where('service.id = :serviceId', { serviceId })
            .andWhere('review.isVisible = :isVisible', { isVisible: true })
            .getRawOne();
        await this.serviceRepository.update(serviceId, {
            avgRating: result.avgRating || 0,
            reviewCount: parseInt(result.reviewCount) || 0,
        });
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(1, (0, typeorm_1.InjectRepository)(service_image_entity_1.ServiceImage)),
    __param(2, (0, typeorm_1.InjectRepository)(service_package_entity_1.ServicePackage)),
    __param(3, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ServicesService);
//# sourceMappingURL=services.service.js.map