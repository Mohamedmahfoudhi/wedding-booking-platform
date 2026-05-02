import { Service } from './service.entity';
export declare class BlockedDate {
    id: string;
    serviceId: string;
    date: Date;
    reason: string;
    createdAt: Date;
    service: Service;
}
