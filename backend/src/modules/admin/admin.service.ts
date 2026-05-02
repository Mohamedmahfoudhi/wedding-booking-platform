import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { Service, ServiceStatus } from '../../database/entities/service.entity';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { Review } from '../../database/entities/review.entity';
import { Category } from '../../database/entities/category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProviderProfile)
    private readonly providerRepository: Repository<ProviderProfile>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalProviders: number;
    totalServices: number;
    totalBookings: number;
    pendingServices: number;
    pendingProviders: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalUsers,
      totalProviders,
      totalServices,
      totalBookings,
      pendingServices,
      pendingProviders,
      totalRevenueResult,
      monthlyRevenueResult,
    ] = await Promise.all([
      this.userRepository.count(),
      this.providerRepository.count(),
      this.serviceRepository.count({ where: { status: ServiceStatus.APPROVED } }),
      this.bookingRepository.count(),
      this.serviceRepository.count({ where: { status: ServiceStatus.PENDING } }),
      this.providerRepository.count({ where: { isVerified: false } }),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
        .getRawOne(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
        .andWhere('payment.createdAt BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getRawOne(),
    ]);

    return {
      totalUsers,
      totalProviders,
      totalServices,
      totalBookings,
      pendingServices,
      pendingProviders,
      totalRevenue: Number(totalRevenueResult?.total) || 0,
      monthlyRevenue: Number(monthlyRevenueResult?.total) || 0,
    };
  }

  async getRevenueChart(months = 12): Promise<{ month: string; revenue: number }[]> {
    const results: { month: string; revenue: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const result = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
        .andWhere('payment.createdAt BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      results.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Number(result?.total) || 0,
      });
    }

    return results;
  }

  // Users management
  async getUsers(
    page = 1,
    limit = 10,
    role?: UserRole,
    search?: string,
  ): Promise<{ users: User[]; total: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    if (role) {
      query.where('user.role = :role', { role });
    }

    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { users, total };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Providers management
  async getProviders(
    page = 1,
    limit = 10,
    verified?: boolean,
    search?: string,
  ): Promise<{ providers: ProviderProfile[]; total: number }> {
    const query = this.providerRepository.createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user');

    if (verified !== undefined) {
      query.where('provider.isVerified = :verified', { verified });
    }

    if (search) {
      query.andWhere(
        '(provider.businessName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [providers, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('provider.createdAt', 'DESC')
      .getManyAndCount();

    return { providers, total };
  }

  async verifyProvider(id: string, verified: boolean): Promise<ProviderProfile> {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.isVerified = verified;
    return this.providerRepository.save(provider);
  }

  async featureProvider(id: string, featured: boolean): Promise<ProviderProfile> {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.isFeatured = featured;
    return this.providerRepository.save(provider);
  }

  // Services management
  async getServices(
    page = 1,
    limit = 10,
    status?: ServiceStatus,
    categoryId?: string,
  ): Promise<{ services: Service[]; total: number }> {
    const query = this.serviceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.images', 'images');

    if (status) {
      query.where('service.status = :status', { status });
    }

    if (categoryId) {
      query.andWhere('service.categoryId = :categoryId', { categoryId });
    }

    const [services, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('service.createdAt', 'DESC')
      .getManyAndCount();

    return { services, total };
  }

  async approveService(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.status = ServiceStatus.APPROVED;
    service.rejectionReason = '';
    return this.serviceRepository.save(service);
  }

  async rejectService(id: string, reason: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.status = ServiceStatus.REJECTED;
    service.rejectionReason = reason;
    return this.serviceRepository.save(service);
  }

  async featureService(id: string, featured: boolean): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.isFeatured = featured;
    return this.serviceRepository.save(service);
  }

  // Reviews management
  async getReviews(
    page = 1,
    limit = 10,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      relations: ['client', 'service'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { reviews, total };
  }

  async toggleReviewVisibility(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.isVisible = !review.isVisible;
    return this.reviewRepository.save(review);
  }

  async deleteReview(id: string): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
