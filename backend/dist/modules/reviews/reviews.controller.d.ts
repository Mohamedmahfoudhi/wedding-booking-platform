import { ReviewsService } from './reviews.service';
import { User } from '../../database/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProvidersService } from '../providers/providers.service';
export declare class ReviewsController {
    private readonly reviewsService;
    private readonly providersService;
    constructor(reviewsService: ReviewsService, providersService: ProvidersService);
    getServiceReviews(serviceId: string, page?: number, limit?: number): Promise<{
        reviews: import("../../database/entities").Review[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(user: User, bookingId: string, createDto: CreateReviewDto): Promise<{
        message: string;
        review: import("../../database/entities").Review;
    }>;
    getMyReviews(user: User, page?: number, limit?: number): Promise<{
        reviews: import("../../database/entities").Review[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(user: User, id: string, updateDto: Partial<CreateReviewDto>): Promise<{
        message: string;
        review: import("../../database/entities").Review;
    }>;
    delete(user: User, id: string): Promise<{
        message: string;
    }>;
    getProviderReviews(user: User, page?: number, limit?: number): Promise<{
        reviews: import("../../database/entities").Review[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    respond(user: User, id: string, body: {
        response: string;
    }): Promise<{
        message: string;
        review: import("../../database/entities").Review;
    }>;
}
