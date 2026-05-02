import { ServicesService } from './services.service';
import { User } from '../../database/entities/user.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { ProvidersService } from '../providers/providers.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    search(filters: ServiceFiltersDto): Promise<{
        services: import("../../database/entities").Service[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getFeatured(limit?: number): Promise<{
        services: import("../../database/entities").Service[];
    }>;
    findById(id: string): Promise<{
        service: import("../../database/entities").Service;
    }>;
}
export declare class ProviderServicesController {
    private readonly servicesService;
    private readonly providersService;
    constructor(servicesService: ServicesService, providersService: ProvidersService);
    private getProviderId;
    create(user: User, createDto: CreateServiceDto): Promise<{
        message: string;
        service: import("../../database/entities").Service;
    }>;
    findAll(user: User, page?: number, limit?: number): Promise<{
        services: import("../../database/entities").Service[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(user: User, id: string): Promise<{
        service: import("../../database/entities").Service;
    }>;
    update(user: User, id: string, updateDto: UpdateServiceDto): Promise<{
        message: string;
        service: import("../../database/entities").Service;
    }>;
    delete(user: User, id: string): Promise<{
        message: string;
    }>;
    addImages(user: User, id: string, body: {
        images: {
            url: string;
            publicId?: string;
        }[];
    }): Promise<{
        message: string;
        images: import("../../database/entities").ServiceImage[];
    }>;
    deleteImage(user: User, id: string, imageId: string): Promise<{
        message: string;
    }>;
    setPrimaryImage(user: User, id: string, imageId: string): Promise<{
        message: string;
    }>;
    addPackage(user: User, id: string, createDto: CreatePackageDto): Promise<{
        message: string;
        package: import("../../database/entities").ServicePackage;
    }>;
    updatePackage(user: User, id: string, packageId: string, updateDto: Partial<CreatePackageDto>): Promise<{
        message: string;
        package: import("../../database/entities").ServicePackage;
    }>;
    deletePackage(user: User, id: string, packageId: string): Promise<{
        message: string;
    }>;
}
