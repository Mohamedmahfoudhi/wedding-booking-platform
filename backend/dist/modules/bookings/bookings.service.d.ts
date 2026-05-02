import { Repository } from 'typeorm';
import { Booking, BookingStatus, CancelledBy } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { AvailabilityService } from '../availability/availability.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly serviceRepository;
    private readonly providerRepository;
    private readonly availabilityService;
    private readonly notificationsService;
    constructor(bookingRepository: Repository<Booking>, serviceRepository: Repository<Service>, providerRepository: Repository<ProviderProfile>, availabilityService: AvailabilityService, notificationsService: NotificationsService);
    private generateBookingNumber;
    create(clientId: string, createDto: CreateBookingDto): Promise<Booking>;
    createManual(providerId: string, createDto: CreateBookingDto & {
        clientName?: string;
        clientEmail?: string;
        clientPhone?: string;
    }): Promise<Booking>;
    findById(id: string): Promise<Booking>;
    findByClient(clientId: string, page?: number, limit?: number, status?: BookingStatus): Promise<{
        bookings: Booking[];
        total: number;
    }>;
    findByProvider(providerId: string, page?: number, limit?: number, status?: BookingStatus, startDate?: Date, endDate?: Date): Promise<{
        bookings: Booking[];
        total: number;
    }>;
    confirm(id: string, providerId: string): Promise<Booking>;
    reject(id: string, providerId: string, reason?: string): Promise<Booking>;
    cancel(id: string, userId: string, cancelledBy: CancelledBy, reason?: string): Promise<Booking>;
    complete(id: string, providerId: string): Promise<Booking>;
    markNoShow(id: string, providerId: string): Promise<Booking>;
    getCalendarEvents(providerId: string, startDate: Date, endDate: Date): Promise<Booking[]>;
    getProviderStats(providerId: string): Promise<{
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        completedBookings: number;
        todayBookings: number;
    }>;
}
