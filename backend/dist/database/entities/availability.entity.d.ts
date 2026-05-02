import { Service } from './service.entity';
export declare class Availability {
    id: string;
    serviceId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    service: Service;
}
