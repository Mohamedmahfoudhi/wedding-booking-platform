import { ProviderProfile } from './provider-profile.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Favorite } from './favorite.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { RefreshToken } from './refresh-token.entity';
export declare enum UserRole {
    CLIENT = "client",
    PROVIDER = "provider",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    role: UserRole;
    isVerified: boolean;
    isActive: boolean;
    verificationToken: string;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    createdAt: Date;
    updatedAt: Date;
    providerProfile: ProviderProfile;
    bookings: Booking[];
    reviews: Review[];
    favorites: Favorite[];
    messages: Message[];
    notifications: Notification[];
    refreshTokens: RefreshToken[];
    get fullName(): string;
}
