import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { BookingStatus, CancelledBy } from '../../database/entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ProvidersService } from '../providers/providers.service';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking (Client)' })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateBookingDto,
  ) {
    const booking = await this.bookingsService.create(user.id, createDto);
    return {
      message: 'Booking created successfully',
      booking,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get my bookings (Client)' })
  async findMyBookings(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: BookingStatus,
  ) {
    const { bookings, total } = await this.bookingsService.findByClient(
      user.id,
      page,
      limit,
      status,
    );

    return {
      bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async findById(@Param('id') id: string) {
    const booking = await this.bookingsService.findById(id);
    return { booking };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking (Client)' })
  async cancel(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const booking = await this.bookingsService.cancel(
      id,
      user.id,
      CancelledBy.CLIENT,
      body.reason,
    );
    return {
      message: 'Booking cancelled successfully',
      booking,
    };
  }
}

@ApiTags('provider/bookings')
@Controller('provider/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth()
export class ProviderBookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly providersService: ProvidersService,
  ) {}

  private async getProviderId(userId: string): Promise<string> {
    const profile = await this.providersService.findByUserId(userId);
    return profile.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings (Provider)' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: BookingStatus,
  ) {
    const providerId = await this.getProviderId(user.id);
    const { bookings, total } = await this.bookingsService.findByProvider(
      providerId,
      page,
      limit,
      status,
    );

    return {
      bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get booking statistics' })
  async getStats(@CurrentUser() user: User) {
    const providerId = await this.getProviderId(user.id);
    const stats = await this.bookingsService.getProviderStats(providerId);
    return { stats };
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get calendar events' })
  async getCalendar(
    @CurrentUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const providerId = await this.getProviderId(user.id);
    const events = await this.bookingsService.getCalendarEvents(
      providerId,
      new Date(start),
      new Date(end),
    );
    return { events };
  }

  @Post()
  @ApiOperation({ summary: 'Create manual booking (SaaS)' })
  async createManual(
    @CurrentUser() user: User,
    @Body() createDto: CreateBookingDto & {
      clientName?: string;
      clientEmail?: string;
      clientPhone?: string;
    },
  ) {
    const providerId = await this.getProviderId(user.id);
    const booking = await this.bookingsService.createManual(providerId, createDto);
    return {
      message: 'Booking created successfully',
      booking,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async findById(@Param('id') id: string) {
    const booking = await this.bookingsService.findById(id);
    return { booking };
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm booking' })
  async confirm(@CurrentUser() user: User, @Param('id') id: string) {
    const providerId = await this.getProviderId(user.id);
    const booking = await this.bookingsService.confirm(id, providerId);
    return {
      message: 'Booking confirmed successfully',
      booking,
    };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject booking' })
  async reject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const providerId = await this.getProviderId(user.id);
    const booking = await this.bookingsService.reject(id, providerId, body.reason);
    return {
      message: 'Booking rejected',
      booking,
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark booking as completed' })
  async complete(@CurrentUser() user: User, @Param('id') id: string) {
    const providerId = await this.getProviderId(user.id);
    const booking = await this.bookingsService.complete(id, providerId);
    return {
      message: 'Booking marked as completed',
      booking,
    };
  }

  @Post(':id/no-show')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark booking as no-show' })
  async markNoShow(@CurrentUser() user: User, @Param('id') id: string) {
    const providerId = await this.getProviderId(user.id);
    const booking = await this.bookingsService.markNoShow(id, providerId);
    return {
      message: 'Booking marked as no-show',
      booking,
    };
  }
}
