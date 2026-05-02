import { ProvidersService } from './providers.service';
import { User } from '../../database/entities/user.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersController {
    private readonly providersService;
    constructor(providersService: ProvidersService);
    register(user: User, createDto: CreateProviderDto): Promise<{
        message: string;
        profile: import("../../database/entities").ProviderProfile;
    }>;
    getProfile(user: User): Promise<{
        profile: import("../../database/entities").ProviderProfile;
    }>;
    updateProfile(user: User, updateDto: UpdateProviderDto): Promise<{
        message: string;
        profile: import("../../database/entities").ProviderProfile;
    }>;
    getDashboardStats(user: User): Promise<{
        stats: {
            totalBookings: number;
            totalRevenue: number;
            avgRating: number;
            reviewCount: number;
        };
    }>;
    findAll(page?: number, limit?: number, city?: string, governorate?: string, verified?: boolean, featured?: boolean): Promise<{
        providers: import("../../database/entities").ProviderProfile[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<{
        provider: import("../../database/entities").ProviderProfile;
    }>;
}
