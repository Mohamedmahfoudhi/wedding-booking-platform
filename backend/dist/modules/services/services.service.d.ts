import { Repository } from 'typeorm';
import { Service } from '../../database/entities/service.entity';
import { ServiceImage } from '../../database/entities/service-image.entity';
import { ServicePackage } from '../../database/entities/service-package.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { CreatePackageDto } from './dto/create-package.dto';
export declare class ServicesService {
    private readonly serviceRepository;
    private readonly imageRepository;
    private readonly packageRepository;
    private readonly providerRepository;
    constructor(serviceRepository: Repository<Service>, imageRepository: Repository<ServiceImage>, packageRepository: Repository<ServicePackage>, providerRepository: Repository<ProviderProfile>);
    create(providerId: string, createDto: CreateServiceDto & {
        images?: {
            url: string;
        }[];
        packages?: {
            name: string;
            description?: string;
            price: number;
        }[];
    }): Promise<Service>;
    findById(id: string): Promise<Service>;
    findByIdForProvider(id: string, providerId: string): Promise<Service>;
    update(id: string, providerId: string, updateDto: UpdateServiceDto & {
        images?: {
            url: string;
        }[];
        packages?: {
            name: string;
            description?: string;
            price: number;
        }[];
    }): Promise<Service>;
    delete(id: string, providerId: string): Promise<void>;
    findByProvider(providerId: string, page?: number, limit?: number): Promise<{
        services: Service[];
        total: number;
    }>;
    search(filters: ServiceFiltersDto): Promise<{
        services: Service[];
        total: number;
    }>;
    getFeatured(limit?: number): Promise<Service[]>;
    addImages(serviceId: string, providerId: string, images: {
        url: string;
        publicId?: string;
    }[]): Promise<ServiceImage[]>;
    deleteImage(serviceId: string, imageId: string, providerId: string): Promise<void>;
    setPrimaryImage(serviceId: string, imageId: string, providerId: string): Promise<void>;
    addPackage(serviceId: string, providerId: string, createDto: CreatePackageDto): Promise<ServicePackage>;
    updatePackage(serviceId: string, packageId: string, providerId: string, updateDto: Partial<CreatePackageDto>): Promise<ServicePackage>;
    deletePackage(serviceId: string, packageId: string, providerId: string): Promise<void>;
    approveService(id: string): Promise<Service>;
    rejectService(id: string, reason: string): Promise<Service>;
    featureService(id: string, featured: boolean): Promise<Service>;
    incrementViewCount(id: string): Promise<void>;
    updateRating(serviceId: string): Promise<void>;
}
