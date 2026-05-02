import { Repository } from 'typeorm';
import { Availability } from '../../database/entities/availability.entity';
import { BlockedDate } from '../../database/entities/blocked-date.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';
export declare class AvailabilityService {
    private readonly availabilityRepository;
    private readonly blockedDateRepository;
    private readonly bookingRepository;
    private readonly serviceRepository;
    constructor(availabilityRepository: Repository<Availability>, blockedDateRepository: Repository<BlockedDate>, bookingRepository: Repository<Booking>, serviceRepository: Repository<Service>);
    getWeeklySchedule(serviceId: string): Promise<Availability[]>;
    setWeeklySchedule(serviceId: string, schedule: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
    }[]): Promise<Availability[]>;
    getBlockedDates(serviceId: string, startDate?: Date, endDate?: Date): Promise<BlockedDate[]>;
    blockDate(serviceId: string, date: Date, reason?: string): Promise<BlockedDate>;
    blockDates(serviceId: string, dates: {
        date: Date;
        reason?: string;
    }[]): Promise<BlockedDate[]>;
    unblockDate(serviceId: string, blockedDateId: string): Promise<void>;
    checkAvailability(serviceId: string, date: Date, startTime?: string, endTime?: string): Promise<boolean>;
    getAvailableDates(serviceId: string, month: number, year: number): Promise<{
        date: string;
        available: boolean;
    }[]>;
    getAvailableTimeSlots(serviceId: string, date: Date): Promise<{
        start: string;
        end: string;
    }[]>;
    private timeToMinutes;
}
