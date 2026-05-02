import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private readonly reviewRepository;
    private readonly bookingRepository;
    private readonly serviceRepository;
    constructor(reviewRepository: Repository<Review>, bookingRepository: Repository<Booking>, serviceRepository: Repository<Service>);
    create(clientId: string, bookingId: string, createDto: CreateReviewDto): Promise<Review>;
    findByService(serviceId: string, page?: number, limit?: number): Promise<{
        reviews: Review[];
        total: number;
    }>;
    findByProvider(providerId: string, page?: number, limit?: number): Promise<{
        reviews: Review[];
        total: number;
    }>;
    findByClient(clientId: string, page?: number, limit?: number): Promise<{
        reviews: Review[];
        total: number;
    }>;
    update(id: string, clientId: string, updateDto: Partial<CreateReviewDto>): Promise<Review>;
    delete(id: string, clientId: string): Promise<void>;
    respond(reviewId: string, providerId: string, response: string): Promise<Review>;
    private updateServiceRating;
}
