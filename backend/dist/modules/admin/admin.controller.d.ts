import { AdminService } from './admin.service';
import { UserRole } from '../../database/entities/user.entity';
import { ServiceStatus } from '../../database/entities/service.entity';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<{
        stats: {
            totalUsers: number;
            totalProviders: number;
            totalServices: number;
            totalBookings: number;
            pendingServices: number;
            pendingProviders: number;
            totalRevenue: number;
            monthlyRevenue: number;
        };
    }>;
    getRevenueChart(months?: number): Promise<{
        data: {
            month: string;
            revenue: number;
        }[];
    }>;
    getUsers(page?: number, limit?: number, role?: UserRole, search?: string): Promise<{
        users: import("../../database/entities/user.entity").User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUser(id: string, body: {
        isActive?: boolean;
        role?: UserRole;
    }): Promise<{
        message: string;
        user: import("../../database/entities/user.entity").User;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getProviders(page?: number, limit?: number, verified?: boolean, search?: string): Promise<{
        providers: import("../../database/entities").ProviderProfile[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    verifyProvider(id: string, body: {
        verified: boolean;
    }): Promise<{
        message: string;
        provider: import("../../database/entities").ProviderProfile;
    }>;
    featureProvider(id: string, body: {
        featured: boolean;
    }): Promise<{
        message: string;
        provider: import("../../database/entities").ProviderProfile;
    }>;
    getServices(page?: number, limit?: number, status?: ServiceStatus, categoryId?: string): Promise<{
        services: import("../../database/entities/service.entity").Service[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveService(id: string): Promise<{
        message: string;
        service: import("../../database/entities/service.entity").Service;
    }>;
    rejectService(id: string, body: {
        reason: string;
    }): Promise<{
        message: string;
        service: import("../../database/entities/service.entity").Service;
    }>;
    featureService(id: string, body: {
        featured: boolean;
    }): Promise<{
        message: string;
        service: import("../../database/entities/service.entity").Service;
    }>;
    getReviews(page?: number, limit?: number): Promise<{
        reviews: import("../../database/entities").Review[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    toggleReviewVisibility(id: string): Promise<{
        message: string;
        review: import("../../database/entities").Review;
    }>;
    deleteReview(id: string): Promise<{
        message: string;
    }>;
}
