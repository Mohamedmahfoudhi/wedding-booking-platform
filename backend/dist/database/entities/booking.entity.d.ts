import { User } from './user.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { ServicePackage } from './service-package.entity';
import { Payment } from './payment.entity';
import { Review } from './review.entity';
export declare enum BookingSource {
    MARKETPLACE = "marketplace",
    SAAS = "saas"
}
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export declare enum CancelledBy {
    CLIENT = "client",
    PROVIDER = "provider",
    ADMIN = "admin"
}
export declare class Booking {
    id: string;
    bookingNumber: string;
    serviceId: string;
    packageId: string;
    clientId: string;
    providerId: string;
    eventDate: Date;
    startTime: string;
    endTime: string;
    guestCount: number;
    source: BookingSource;
    status: BookingStatus;
    subtotal: number;
    discount: number;
    total: number;
    depositAmount: number;
    depositPaid: boolean;
    fullyPaid: boolean;
    notes: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    cancelledBy: CancelledBy;
    cancellationReason: string;
    cancelledAt: Date;
    createdAt: Date;
    updatedAt: Date;
    service: Service;
    package: ServicePackage;
    client: User;
    provider: ProviderProfile;
    payments: Payment[];
    review: Review;
}
