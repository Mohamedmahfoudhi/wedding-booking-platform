import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(ProviderProfile)
    private readonly providerRepository: Repository<ProviderProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createProfile(userId: string, createDto: CreateProviderDto): Promise<ProviderProfile> {
    // Check if user already has a profile
    const existingProfile = await this.providerRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Provider profile already exists');
    }

    // Generate unique slug
    let slug = slugify(createDto.businessName, { lower: true, strict: true });
    const existingSlug = await this.providerRepository.findOne({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create profile
    const profile = this.providerRepository.create({
      userId,
      ...createDto,
      slug,
    });

    await this.providerRepository.save(profile);

    // Update user role to provider
    await this.userRepository.update(userId, { role: UserRole.PROVIDER });

    return profile;
  }

  async findByUserId(userId: string): Promise<ProviderProfile> {
    const profile = await this.providerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return profile;
  }

  async findBySlug(slug: string): Promise<ProviderProfile> {
    const profile = await this.providerRepository.findOne({
      where: { slug },
      relations: ['user', 'services', 'services.images', 'services.category'],
    });

    if (!profile) {
      throw new NotFoundException('Provider not found');
    }

    return profile;
  }

  async findBySlugOrId(slugOrId: string): Promise<ProviderProfile> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const where = uuidRegex.test(slugOrId) ? { id: slugOrId } : { slug: slugOrId };

    const profile = await this.providerRepository.findOne({
      where,
      relations: ['user', 'services', 'services.images', 'services.category'],
    });

    if (!profile) {
      throw new NotFoundException('Provider not found');
    }

    return profile;
  }

  async findById(id: string): Promise<ProviderProfile> {
    const profile = await this.providerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateProviderDto,
  ): Promise<ProviderProfile> {
    const profile = await this.findByUserId(userId);

    // If updating business name, update slug
    if (updateDto.businessName && updateDto.businessName !== profile.businessName) {
      let slug = slugify(updateDto.businessName, { lower: true, strict: true });
      const existingSlug = await this.providerRepository.findOne({
        where: { slug },
      });
      if (existingSlug && existingSlug.id !== profile.id) {
        slug = `${slug}-${Date.now()}`;
      }
      (updateDto as Partial<ProviderProfile>).slug = slug;
    }

    Object.assign(profile, updateDto);
    return this.providerRepository.save(profile);
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      city?: string;
      governorate?: string;
      isVerified?: boolean;
      isFeatured?: boolean;
    },
  ): Promise<{ providers: ProviderProfile[]; total: number }> {
    const query = this.providerRepository.createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .where('user.isActive = :isActive', { isActive: true });

    if (filters?.city) {
      query.andWhere('provider.city = :city', { city: filters.city });
    }

    if (filters?.governorate) {
      query.andWhere('provider.governorate = :governorate', {
        governorate: filters.governorate,
      });
    }

    if (filters?.isVerified !== undefined) {
      query.andWhere('provider.isVerified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    if (filters?.isFeatured !== undefined) {
      query.andWhere('provider.isFeatured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    const [providers, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('provider.createdAt', 'DESC')
      .getManyAndCount();

    return { providers, total };
  }

  async verifyProvider(providerId: string): Promise<ProviderProfile> {
    const profile = await this.findById(providerId);
    profile.isVerified = true;
    return this.providerRepository.save(profile);
  }

  async featureProvider(providerId: string, featured: boolean): Promise<ProviderProfile> {
    const profile = await this.findById(providerId);
    profile.isFeatured = featured;
    return this.providerRepository.save(profile);
  }

  async updateStripeAccount(
    providerId: string,
    stripeAccountId: string,
    onboarded: boolean,
  ): Promise<void> {
    await this.providerRepository.update(providerId, {
      stripeAccountId,
      stripeOnboarded: onboarded,
    });
  }

  async getDashboardStats(providerId: string): Promise<{
    totalBookings: number;
    totalRevenue: number;
    avgRating: number;
    reviewCount: number;
  }> {
    const profile = await this.findById(providerId);

    return {
      totalBookings: profile.totalBookings,
      totalRevenue: Number(profile.totalRevenue),
      avgRating: Number(profile.avgRating),
      reviewCount: profile.reviewCount,
    };
  }
}
