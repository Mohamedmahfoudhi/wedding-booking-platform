import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Service, ServiceStatus } from '../../database/entities/service.entity';
import { ServiceImage } from '../../database/entities/service-image.entity';
import { ServicePackage } from '../../database/entities/service-package.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceImage)
    private readonly imageRepository: Repository<ServiceImage>,
    @InjectRepository(ServicePackage)
    private readonly packageRepository: Repository<ServicePackage>,
    @InjectRepository(ProviderProfile)
    private readonly providerRepository: Repository<ProviderProfile>,
  ) {}

  async create(providerId: string, createDto: CreateServiceDto & { images?: { url: string }[]; packages?: { name: string; description?: string; price: number }[] }): Promise<Service> {
    // Generate unique slug
    let slug = slugify(createDto.name, { lower: true, strict: true });
    const existingSlug = await this.serviceRepository.findOne({
      where: { slug, providerId },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Extract images and packages from DTO
    const { images, packages, ...serviceData } = createDto;

    const service = this.serviceRepository.create({
      ...serviceData,
      providerId,
      slug,
      status: ServiceStatus.PENDING,
    });

    const savedService = await this.serviceRepository.save(service);

    // Add images if provided
    if (images && images.length > 0) {
      const imageEntities = images.map((img, index) =>
        this.imageRepository.create({
          serviceId: savedService.id,
          url: img.url,
          isPrimary: index === 0,
          displayOrder: index,
        })
      );
      await this.imageRepository.save(imageEntities);
    }

    // Add packages if provided
    if (packages && packages.length > 0) {
      const packageEntities = packages.map((pkg, index) =>
        this.packageRepository.create({
          serviceId: savedService.id,
          name: pkg.name,
          description: pkg.description || '',
          price: pkg.price,
          displayOrder: index,
        })
      );
      await this.packageRepository.save(packageEntities);
    }

    // Return the service with relations
    return this.findById(savedService.id);
  }

  async findById(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider', 'provider.user', 'category', 'images', 'packages'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findByIdForProvider(id: string, providerId: string): Promise<Service> {
    const service = await this.findById(id);

    if (service.providerId !== providerId) {
      throw new ForbiddenException('You do not have access to this service');
    }

    return service;
  }

  async update(
    id: string,
    providerId: string,
    updateDto: UpdateServiceDto & { images?: { url: string }[]; packages?: { name: string; description?: string; price: number }[] },
  ): Promise<Service> {
    const service = await this.findByIdForProvider(id, providerId);

    // Extract images and packages from DTO to handle separately
    const { images, packages, ...serviceData } = updateDto;

    // If updating name, update slug
    if (serviceData.name && serviceData.name !== service.name) {
      let slug = slugify(serviceData.name, { lower: true, strict: true });
      const existingSlug = await this.serviceRepository.findOne({
        where: { slug, providerId },
      });
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      (serviceData as Partial<Service>).slug = slug;
    }

    Object.assign(service, serviceData);
    const savedService = await this.serviceRepository.save(service);

    // Handle images update if provided
    if (images !== undefined) {
      // Remove existing images
      await this.imageRepository.delete({ serviceId: id });

      // Add new images
      if (images.length > 0) {
        const imageEntities = images.map((img, index) =>
          this.imageRepository.create({
            serviceId: id,
            url: img.url,
            isPrimary: index === 0,
            displayOrder: index,
          })
        );
        await this.imageRepository.save(imageEntities);
      }
    }

    // Handle packages update if provided
    if (packages !== undefined) {
      // Remove existing packages
      await this.packageRepository.delete({ serviceId: id });

      // Add new packages
      if (packages.length > 0) {
        const packageEntities = packages.map((pkg, index) =>
          this.packageRepository.create({
            serviceId: id,
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price,
            displayOrder: index,
          })
        );
        await this.packageRepository.save(packageEntities);
      }
    }

    // Return the updated service with relations
    return this.findById(id);
  }

  async delete(id: string, providerId: string): Promise<void> {
    const service = await this.findByIdForProvider(id, providerId);
    await this.serviceRepository.remove(service);
  }

  async findByProvider(
    providerId: string,
    page = 1,
    limit = 10,
  ): Promise<{ services: Service[]; total: number }> {
    const [services, total] = await this.serviceRepository.findAndCount({
      where: { providerId },
      relations: ['category', 'images'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { services, total };
  }

  async search(
    filters: ServiceFiltersDto,
  ): Promise<{ services: Service[]; total: number }> {
    const query = this.serviceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.images', 'images')
      .where('service.status = :status', { status: ServiceStatus.APPROVED })
      .andWhere('service.isActive = :isActive', { isActive: true });

    // Category filter
    if (filters.category) {
      query.andWhere('category.slug = :categorySlug', {
        categorySlug: filters.category,
      });
    }

    // Location filters
    if (filters.city) {
      query.andWhere('provider.city = :city', { city: filters.city });
    }

    if (filters.governorate) {
      query.andWhere('provider.governorate = :governorate', {
        governorate: filters.governorate,
      });
    }

    // Price range
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

    // Rating filter
    if (filters.ratingMin !== undefined) {
      query.andWhere('service.avgRating >= :ratingMin', {
        ratingMin: filters.ratingMin,
      });
    }

    // Capacity filter
    if (filters.capacity !== undefined) {
      query.andWhere(
        '(service.capacityMin IS NULL OR service.capacityMin <= :capacity)',
        { capacity: filters.capacity },
      );
      query.andWhere(
        '(service.capacityMax IS NULL OR service.capacityMax >= :capacity)',
        { capacity: filters.capacity },
      );
    }

    // Featured only
    if (filters.featured) {
      query.andWhere('service.isFeatured = :isFeatured', { isFeatured: true });
    }

    // Sorting
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

  async getFeatured(limit = 8): Promise<Service[]> {
    return this.serviceRepository.find({
      where: {
        status: ServiceStatus.APPROVED,
        isActive: true,
        isFeatured: true,
      },
      relations: ['provider', 'category', 'images'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  // Image management
  async addImages(
    serviceId: string,
    providerId: string,
    images: { url: string; publicId?: string }[],
  ): Promise<ServiceImage[]> {
    await this.findByIdForProvider(serviceId, providerId);

    const existingImages = await this.imageRepository.count({
      where: { serviceId },
    });

    const newImages = images.map((img, index) =>
      this.imageRepository.create({
        serviceId,
        url: img.url,
        publicId: img.publicId,
        displayOrder: existingImages + index,
        isPrimary: existingImages === 0 && index === 0,
      }),
    );

    return this.imageRepository.save(newImages);
  }

  async deleteImage(
    serviceId: string,
    imageId: string,
    providerId: string,
  ): Promise<void> {
    await this.findByIdForProvider(serviceId, providerId);

    const image = await this.imageRepository.findOne({
      where: { id: imageId, serviceId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.imageRepository.remove(image);
  }

  async setPrimaryImage(
    serviceId: string,
    imageId: string,
    providerId: string,
  ): Promise<void> {
    await this.findByIdForProvider(serviceId, providerId);

    // Reset all images
    await this.imageRepository.update({ serviceId }, { isPrimary: false });

    // Set new primary
    await this.imageRepository.update(
      { id: imageId, serviceId },
      { isPrimary: true },
    );
  }

  // Package management
  async addPackage(
    serviceId: string,
    providerId: string,
    createDto: CreatePackageDto,
  ): Promise<ServicePackage> {
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

  async updatePackage(
    serviceId: string,
    packageId: string,
    providerId: string,
    updateDto: Partial<CreatePackageDto>,
  ): Promise<ServicePackage> {
    await this.findByIdForProvider(serviceId, providerId);

    const pkg = await this.packageRepository.findOne({
      where: { id: packageId, serviceId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    Object.assign(pkg, updateDto);
    return this.packageRepository.save(pkg);
  }

  async deletePackage(
    serviceId: string,
    packageId: string,
    providerId: string,
  ): Promise<void> {
    await this.findByIdForProvider(serviceId, providerId);

    const pkg = await this.packageRepository.findOne({
      where: { id: packageId, serviceId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    await this.packageRepository.remove(pkg);
  }

  // Admin operations
  async approveService(id: string): Promise<Service> {
    const service = await this.findById(id);
    service.status = ServiceStatus.APPROVED;
    service.rejectionReason = '';
    return this.serviceRepository.save(service);
  }

  async rejectService(id: string, reason: string): Promise<Service> {
    const service = await this.findById(id);
    service.status = ServiceStatus.REJECTED;
    service.rejectionReason = reason;
    return this.serviceRepository.save(service);
  }

  async featureService(id: string, featured: boolean): Promise<Service> {
    const service = await this.findById(id);
    service.isFeatured = featured;
    return this.serviceRepository.save(service);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.serviceRepository.increment({ id }, 'viewCount', 1);
  }

  async updateRating(serviceId: string): Promise<void> {
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
}
