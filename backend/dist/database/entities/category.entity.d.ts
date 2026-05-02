import { Service } from './service.entity';
export declare class Category {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    description: string;
    icon: string;
    image: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    services: Service[];
}
