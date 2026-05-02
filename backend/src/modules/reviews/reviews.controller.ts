import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProvidersService } from '../providers/providers.service';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly providersService: ProvidersService,
  ) {}

  @Public()
  @Get('services/:serviceId/reviews')
  @ApiOperation({ summary: 'Get service reviews' })
  async getServiceReviews(
    @Param('serviceId') serviceId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const { reviews, total } = await this.reviewsService.findByService(
      serviceId,
      page,
      limit,
    );

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post('bookings/:bookingId/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a completed booking' })
  async create(
    @CurrentUser() user: User,
    @Param('bookingId') bookingId: string,
    @Body() createDto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.create(user.id, bookingId, createDto);
    return {
      message: 'Review submitted successfully',
      review,
    };
  }

  @Get('reviews/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reviews' })
  async getMyReviews(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const { reviews, total } = await this.reviewsService.findByClient(
      user.id,
      page,
      limit,
    );

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my review' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateReviewDto>,
  ) {
    const review = await this.reviewsService.update(id, user.id, updateDto);
    return {
      message: 'Review updated successfully',
      review,
    };
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete my review' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    await this.reviewsService.delete(id, user.id);
    return { message: 'Review deleted successfully' };
  }

  @Get('provider/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews on my services' })
  async getProviderReviews(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const profile = await this.providersService.findByUserId(user.id);
    const { reviews, total } = await this.reviewsService.findByProvider(
      profile.id,
      page,
      limit,
    );

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post('provider/reviews/:id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a review' })
  async respond(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { response: string },
  ) {
    const profile = await this.providersService.findByUserId(user.id);
    const review = await this.reviewsService.respond(id, profile.id, body.response);
    return {
      message: 'Response added successfully',
      review,
    };
  }
}
