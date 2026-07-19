import { PriceType } from '../../../database/entities/service.entity';
export declare class ServiceImageDto {
    url: string;
    publicId?: string;
}
export declare class ServicePackageDto {
    name: string;
    description?: string;
    price: number;
}
export declare class CreateServiceDto {
    name: string;
    categoryId: string;
    description?: string;
    shortDescription?: string;
    basePrice: number;
    priceType?: PriceType;
    durationMinutes?: number;
    capacityMin?: number;
    capacityMax?: number;
    location?: string;
    images?: ServiceImageDto[];
    packages?: ServicePackageDto[];
}
