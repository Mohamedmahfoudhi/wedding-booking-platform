import { Service } from './service.entity';
export declare class ServiceImage {
    id: string;
    serviceId: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
    displayOrder: number;
    createdAt: Date;
    service: Service;
}
