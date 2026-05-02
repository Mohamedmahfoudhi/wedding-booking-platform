import { Repository } from 'typeorm';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { User } from '../../database/entities/user.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersService {
    private readonly providerRepository;
    private readonly userRepository;
    constructor(providerRepository: Repository<ProviderProfile>, userRepository: Repository<User>);
    createProfile(userId: string, createDto: CreateProviderDto): Promise<ProviderProfile>;
    findByUserId(userId: string): Promise<ProviderProfile>;
    findBySlug(slug: string): Promise<ProviderProfile>;
    findById(id: string): Promise<ProviderProfile>;
    updateProfile(userId: string, updateDto: UpdateProviderDto): Promise<ProviderProfile>;
    findAll(page?: number, limit?: number, filters?: {
        city?: string;
        governorate?: string;
        isVerified?: boolean;
        isFeatured?: boolean;
    }): Promise<{
        providers: ProviderProfile[];
        total: number;
    }>;
    verifyProvider(providerId: string): Promise<ProviderProfile>;
    featureProvider(providerId: string, featured: boolean): Promise<ProviderProfile>;
    updateStripeAccount(providerId: string, stripeAccountId: string, onboarded: boolean): Promise<void>;
    getDashboardStats(providerId: string): Promise<{
        totalBookings: number;
        totalRevenue: number;
        avgRating: number;
        reviewCount: number;
    }>;
}
