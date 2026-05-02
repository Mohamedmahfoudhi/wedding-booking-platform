export declare class CreateBookingDto {
    serviceId: string;
    packageId?: string;
    clientId?: string;
    eventDate: Date;
    startTime?: string;
    endTime?: string;
    guestCount?: number;
    notes?: string;
    discount?: number;
    depositAmount?: number;
}
