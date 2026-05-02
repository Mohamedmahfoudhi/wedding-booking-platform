import { PriceType } from '../../../database/entities/service.entity';
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
}
