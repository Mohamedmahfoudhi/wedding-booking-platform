import { Service } from './service.entity';
export declare class ServicePackage {
    id: string;
    serviceId: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    isPopular: boolean;
    displayOrder: number;
    createdAt: Date;
    service: Service;
}
