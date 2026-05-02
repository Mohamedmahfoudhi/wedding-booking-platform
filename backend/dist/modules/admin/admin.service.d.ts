import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { Service, ServiceStatus } from '../../database/entities/service.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Review } from '../../database/entities/review.entity';
import { Category } from '../../database/entities/category.entity';
export declare class AdminService {
    private readonly userRepository;
    private readonly providerRepository;
    private readonly serviceRepository;
    private readonly bookingRepository;
    private readonly paymentRepository;
    private readonly reviewRepository;
    private readonly categoryRepository;
    constructor(userRepository: Repository<User>, providerRepository: Repository<ProviderProfile>, serviceRepository: Repository<Service>, bookingRepository: Repository<Booking>, paymentRepository: Repository<Payment>, reviewRepository: Repository<Review>, categoryRepository: Repository<Category>);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalProviders: number;
        totalServices: number;
        totalBookings: number;
        pendingServices: number;
        pendingProviders: number;
        totalRevenue: number;
        monthlyRevenue: number;
    }>;
    getRevenueChart(months?: number): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getUsers(page?: number, limit?: number, role?: UserRole, search?: string): Promise<{
        users: User[];
        total: number;
    }>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    getProviders(page?: number, limit?: number, verified?: boolean, search?: string): Promise<{
        providers: ProviderProfile[];
        total: number;
    }>;
    verifyProvider(id: string, verified: boolean): Promise<ProviderProfile>;
    featureProvider(id: string, featured: boolean): Promise<ProviderProfile>;
    getServices(page?: number, limit?: number, status?: ServiceStatus, categoryId?: string): Promise<{
        services: Service[];
        total: number;
    }>;
    approveService(id: string): Promise<Service>;
    rejectService(id: string, reason: string): Promise<Service>;
    featureService(id: string, featured: boolean): Promise<Service>;
    getReviews(page?: number, limit?: number): Promise<{
        reviews: Review[];
        total: number;
    }>;
    toggleReviewVisibility(id: string): Promise<Review>;
    deleteReview(id: string): Promise<void>;
}
