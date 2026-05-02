import { ProviderProfile } from './provider-profile.entity';
import { Category } from './category.entity';
import { ServiceImage } from './service-image.entity';
import { ServicePackage } from './service-package.entity';
import { Availability } from './availability.entity';
import { BlockedDate } from './blocked-date.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Favorite } from './favorite.entity';
export declare enum PriceType {
    FIXED = "fixed",
    HOURLY = "hourly",
    DAILY = "daily",
    CUSTOM = "custom"
}
export declare enum ServiceStatus {
    DRAFT = "draft",
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Service {
    id: string;
    providerId: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    priceType: PriceType;
    durationMinutes: number;
    capacityMin: number;
    capacityMax: number;
    isActive: boolean;
    isFeatured: boolean;
    status: ServiceStatus;
    rejectionReason: string;
    avgRating: number;
    reviewCount: number;
    bookingCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    provider: ProviderProfile;
    category: Category;
    images: ServiceImage[];
    packages: ServicePackage[];
    availability: Availability[];
    blockedDates: BlockedDate[];
    bookings: Booking[];
    reviews: Review[];
    favorites: Favorite[];
}
