import { BookingsService } from './bookings.service';
import { User } from '../../database/entities/user.entity';
import { BookingStatus } from '../../database/entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ProvidersService } from '../providers/providers.service';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: User, createDto: CreateBookingDto): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    findMyBookings(user: User, page?: number, limit?: number, status?: BookingStatus): Promise<{
        bookings: import("../../database/entities/booking.entity").Booking[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    cancel(user: User, id: string, body: {
        reason?: string;
    }): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
}
export declare class ProviderBookingsController {
    private readonly bookingsService;
    private readonly providersService;
    constructor(bookingsService: BookingsService, providersService: ProvidersService);
    private getProviderId;
    findAll(user: User, page?: number, limit?: number, status?: BookingStatus): Promise<{
        bookings: import("../../database/entities/booking.entity").Booking[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(user: User): Promise<{
        stats: {
            totalBookings: number;
            pendingBookings: number;
            confirmedBookings: number;
            completedBookings: number;
            todayBookings: number;
        };
    }>;
    getCalendar(user: User, start: string, end: string): Promise<{
        events: import("../../database/entities/booking.entity").Booking[];
    }>;
    createManual(user: User, createDto: CreateBookingDto & {
        clientName?: string;
        clientEmail?: string;
        clientPhone?: string;
    }): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    findById(id: string): Promise<{
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    confirm(user: User, id: string): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    reject(user: User, id: string, body: {
        reason?: string;
    }): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    complete(user: User, id: string): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
    markNoShow(user: User, id: string): Promise<{
        message: string;
        booking: import("../../database/entities/booking.entity").Booking;
    }>;
}
