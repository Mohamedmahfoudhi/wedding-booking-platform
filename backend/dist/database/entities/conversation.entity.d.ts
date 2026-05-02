import { User } from './user.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: string;
    clientId: string;
    providerId: string;
    serviceId: string;
    bookingId: string;
    lastMessageAt: Date;
    createdAt: Date;
    client: User;
    provider: ProviderProfile;
    service: Service;
    booking: Booking;
    messages: Message[];
}
