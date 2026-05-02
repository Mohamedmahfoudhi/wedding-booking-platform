import { Booking } from './booking.entity';
export declare enum PaymentType {
    DEPOSIT = "deposit",
    FULL = "full",
    REMAINING = "remaining"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare class Payment {
    id: string;
    bookingId: string;
    stripePaymentId: string;
    amount: number;
    currency: string;
    type: PaymentType;
    status: PaymentStatus;
    method: string;
    refundAmount: number;
    refundReason: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    booking: Booking;
}
