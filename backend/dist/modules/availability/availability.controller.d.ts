import { AvailabilityService } from './availability.service';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    getSchedule(serviceId: string): Promise<{
        schedule: import("../../database/entities").Availability[];
    }>;
    getAvailableDates(serviceId: string, month: number, year: number): Promise<{
        dates: {
            date: string;
            available: boolean;
        }[];
    }>;
    getAvailableTimeSlots(serviceId: string, date: string): Promise<{
        slots: {
            start: string;
            end: string;
        }[];
    }>;
    checkAvailability(serviceId: string, date: string, startTime?: string, endTime?: string): Promise<{
        available: boolean;
    }>;
    getPublicBlockedDates(serviceId: string, start?: string, end?: string): Promise<{
        blockedDates: import("../../database/entities").BlockedDate[];
    }>;
}
export declare class ProviderAvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    getSchedule(serviceId: string): Promise<{
        schedule: import("../../database/entities").Availability[];
    }>;
    setSchedule(serviceId: string, body: {
        schedule: {
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            isAvailable: boolean;
        }[];
    }): Promise<{
        message: string;
        schedule: import("../../database/entities").Availability[];
    }>;
    getBlockedDates(serviceId: string, start?: string, end?: string): Promise<{
        blockedDates: import("../../database/entities").BlockedDate[];
    }>;
    blockDates(serviceId: string, body: {
        dates: {
            date: string;
            reason?: string;
        }[];
    }): Promise<{
        message: string;
        blockedDates: import("../../database/entities").BlockedDate[];
    }>;
    unblockDate(serviceId: string, blockedDateId: string): Promise<{
        message: string;
    }>;
}
