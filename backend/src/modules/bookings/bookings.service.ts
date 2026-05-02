import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Booking,
  BookingStatus,
  BookingSource,
  CancelledBy,
} from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { AvailabilityService } from '../availability/availability.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ProviderProfile)
    private readonly providerRepository: Repository<ProviderProfile>,
    private readonly availabilityService: AvailabilityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private generateBookingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `WB-${timestamp}-${random}`;
  }

  async create(
    clientId: string,
    createDto: CreateBookingDto,
  ): Promise<Booking> {
    // Get service details
    const service = await this.serviceRepository.findOne({
      where: { id: createDto.serviceId },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check availability
    const isAvailable = await this.availabilityService.checkAvailability(
      createDto.serviceId,
      createDto.eventDate,
      createDto.startTime,
      createDto.endTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Selected date/time is not available');
    }

    // Calculate total
    let subtotal = Number(service.basePrice);
    if (createDto.packageId) {
      // Add package price logic if needed
    }

    const total = subtotal - (createDto.discount || 0);

    // Create booking
    const booking = this.bookingRepository.create({
      bookingNumber: this.generateBookingNumber(),
      serviceId: createDto.serviceId,
      packageId: createDto.packageId,
      clientId,
      providerId: service.providerId,
      eventDate: createDto.eventDate,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      guestCount: createDto.guestCount,
      notes: createDto.notes,
      source: BookingSource.MARKETPLACE,
      status: BookingStatus.PENDING,
      subtotal,
      discount: createDto.discount || 0,
      total,
      depositAmount: createDto.depositAmount,
    });

    await this.bookingRepository.save(booking);

    // Notify provider
    await this.notificationsService.create(
      service.provider.userId,
      NotificationType.BOOKING_CREATED,
      'New Booking Request',
      `You have a new booking request for ${service.name}`,
      { bookingId: booking.id },
    );

    return booking;
  }

  async createManual(
    providerId: string,
    createDto: CreateBookingDto & {
      clientName?: string;
      clientEmail?: string;
      clientPhone?: string;
    },
  ): Promise<Booking> {
    // Get service details
    const service = await this.serviceRepository.findOne({
      where: { id: createDto.serviceId, providerId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Calculate total
    const subtotal = Number(service.basePrice);
    const total = subtotal - (createDto.discount || 0);

    // Create booking (SaaS - internal)
    const booking = this.bookingRepository.create({
      bookingNumber: this.generateBookingNumber(),
      serviceId: createDto.serviceId,
      packageId: createDto.packageId,
      clientId: createDto.clientId || null as unknown as string,
      providerId,
      eventDate: createDto.eventDate,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      guestCount: createDto.guestCount,
      notes: createDto.notes,
      clientName: createDto.clientName,
      clientEmail: createDto.clientEmail,
      clientPhone: createDto.clientPhone,
      source: BookingSource.SAAS,
      status: BookingStatus.CONFIRMED,
      subtotal,
      discount: createDto.discount || 0,
      total,
    });

    return this.bookingRepository.save(booking);
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['service', 'service.images', 'provider', 'provider.user', 'client', 'package'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByClient(
    clientId: string,
    page = 1,
    limit = 10,
    status?: BookingStatus,
  ): Promise<{ bookings: Booking[]; total: number }> {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('service.images', 'images')
      .leftJoinAndSelect('booking.provider', 'provider')
      .where('booking.clientId = :clientId', { clientId });

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    const [bookings, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.eventDate', 'DESC')
      .getManyAndCount();

    return { bookings, total };
  }

  async findByProvider(
    providerId: string,
    page = 1,
    limit = 10,
    status?: BookingStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ bookings: Booking[]; total: number }> {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.client', 'client')
      .where('booking.providerId = :providerId', { providerId });

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('booking.eventDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [bookings, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.eventDate', 'DESC')
      .getManyAndCount();

    return { bookings, total };
  }

  async confirm(id: string, providerId: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepository.save(booking);

    // Notify client
    if (booking.clientId) {
      await this.notificationsService.create(
        booking.clientId,
        NotificationType.BOOKING_CONFIRMED,
        'Booking Confirmed',
        `Your booking for ${booking.service.name} has been confirmed`,
        { bookingId: booking.id },
      );
    }

    return booking;
  }

  async reject(id: string, providerId: string, reason?: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledBy = CancelledBy.PROVIDER;
    booking.cancellationReason = reason || 'Provider rejected the booking';
    booking.cancelledAt = new Date();
    await this.bookingRepository.save(booking);

    // Notify client
    if (booking.clientId) {
      await this.notificationsService.create(
        booking.clientId,
        NotificationType.BOOKING_CANCELLED,
        'Booking Cancelled',
        `Your booking for ${booking.service.name} was cancelled by the provider`,
        { bookingId: booking.id },
      );
    }

    return booking;
  }

  async cancel(
    id: string,
    userId: string,
    cancelledBy: CancelledBy,
    reason?: string,
  ): Promise<Booking> {
    const booking = await this.findById(id);

    // Verify access
    if (cancelledBy === CancelledBy.CLIENT && booking.clientId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    if (
      [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)
    ) {
      throw new BadRequestException('This booking cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledBy = cancelledBy;
    booking.cancellationReason = reason || '';
    booking.cancelledAt = new Date();
    await this.bookingRepository.save(booking);

    return booking;
  }

  async complete(id: string, providerId: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepository.save(booking);

    // Update provider stats
    await this.providerRepository.increment(
      { id: providerId },
      'totalBookings',
      1,
    );

    await this.providerRepository.increment(
      { id: providerId },
      'totalRevenue',
      Number(booking.total),
    );

    // Notify client
    if (booking.clientId) {
      await this.notificationsService.create(
        booking.clientId,
        NotificationType.BOOKING_COMPLETED,
        'Booking Completed',
        `Your booking for ${booking.service.name} has been completed. Please leave a review!`,
        { bookingId: booking.id },
      );
    }

    return booking;
  }

  async markNoShow(id: string, providerId: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    booking.status = BookingStatus.NO_SHOW;
    return this.bookingRepository.save(booking);
  }

  async getCalendarEvents(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: {
        providerId,
        eventDate: Between(startDate, endDate),
        status: BookingStatus.CONFIRMED,
      },
      relations: ['service', 'client'],
      order: { eventDate: 'ASC', startTime: 'ASC' },
    });
  }

  async getProviderStats(providerId: string): Promise<{
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    todayBookings: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, pending, confirmed, completed, todayCount] = await Promise.all([
      this.bookingRepository.count({ where: { providerId } }),
      this.bookingRepository.count({
        where: { providerId, status: BookingStatus.PENDING },
      }),
      this.bookingRepository.count({
        where: { providerId, status: BookingStatus.CONFIRMED },
      }),
      this.bookingRepository.count({
        where: { providerId, status: BookingStatus.COMPLETED },
      }),
      this.bookingRepository.count({
        where: {
          providerId,
          eventDate: Between(today, tomorrow),
          status: BookingStatus.CONFIRMED,
        },
      }),
    ]);

    return {
      totalBookings: total,
      pendingBookings: pending,
      confirmedBookings: confirmed,
      completedBookings: completed,
      todayBookings: todayCount,
    };
  }
}
