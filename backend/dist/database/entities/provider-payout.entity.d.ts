import { ProviderProfile } from './provider-profile.entity';
import { Booking } from './booking.entity';
export declare enum PayoutStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class ProviderPayout {
    id: string;
    providerId: string;
    bookingId: string;
    stripeTransferId: string;
    amount: number;
    commission: number;
    netAmount: number;
    status: PayoutStatus;
    createdAt: Date;
    updatedAt: Date;
    provider: ProviderProfile;
    booking: Booking;
}
