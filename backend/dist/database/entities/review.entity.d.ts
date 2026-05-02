import { User } from './user.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
export declare class Review {
    id: string;
    bookingId: string;
    serviceId: string;
    clientId: string;
    rating: number;
    comment: string;
    providerResponse: string;
    responseDate: Date;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
    booking: Booking;
    service: Service;
    client: User;
}
