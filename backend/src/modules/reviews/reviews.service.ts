import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(
    clientId: string,
    bookingId: string,
    createDto: CreateReviewDto,
  ): Promise<Review> {
    // Check if booking exists and belongs to client
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, clientId },
      relations: ['service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: { bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this booking');
    }

    // Create review
    const review = this.reviewRepository.create({
      bookingId,
      serviceId: booking.serviceId,
      clientId,
      rating: createDto.rating,
      comment: createDto.comment,
    });

    await this.reviewRepository.save(review);

    // Update service rating
    await this.updateServiceRating(booking.serviceId);

    return review;
  }

  async findByService(
    serviceId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { serviceId, isVisible: true },
      relations: ['client'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { reviews, total };
  }

  async findByProvider(
    providerId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.client', 'client')
      .leftJoinAndSelect('review.service', 'service')
      .leftJoin('service.provider', 'provider')
      .where('provider.id = :providerId', { providerId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('review.createdAt', 'DESC')
      .getManyAndCount();

    return { reviews, total };
  }

  async findByClient(
    clientId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { clientId },
      relations: ['service'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { reviews, total };
  }

  async update(
    id: string,
    clientId: string,
    updateDto: Partial<CreateReviewDto>,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, clientId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    Object.assign(review, updateDto);
    await this.reviewRepository.save(review);

    // Update service rating
    await this.updateServiceRating(review.serviceId);

    return review;
  }

  async delete(id: string, clientId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id, clientId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const serviceId = review.serviceId;
    await this.reviewRepository.remove(review);

    // Update service rating
    await this.updateServiceRating(serviceId);
  }

  async respond(
    reviewId: string,
    providerId: string,
    response: string,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['service', 'service.provider'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.service.providerId !== providerId) {
      throw new ForbiddenException('You cannot respond to this review');
    }

    review.providerResponse = response;
    review.responseDate = new Date();
    return this.reviewRepository.save(review);
  }

  private async updateServiceRating(serviceId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.serviceId = :serviceId', { serviceId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .getRawOne();

    await this.serviceRepository.update(serviceId, {
      avgRating: result.avgRating || 0,
      reviewCount: parseInt(result.reviewCount) || 0,
    });
  }
}
