import { User } from './user.entity';
import { Service } from './service.entity';
export declare class Favorite {
    id: string;
    userId: string;
    serviceId: string;
    createdAt: Date;
    user: User;
    service: Service;
}
