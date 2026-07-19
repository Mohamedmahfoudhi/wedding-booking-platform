"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../../database/entities/booking.entity");
const service_entity_1 = require("../../database/entities/service.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const availability_service_1 = require("../availability/availability.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
let BookingsService = class BookingsService {
    constructor(bookingRepository, serviceRepository, providerRepository, availabilityService, notificationsService) {
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.providerRepository = providerRepository;
        this.availabilityService = availabilityService;
        this.notificationsService = notificationsService;
    }
    generateBookingNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `WB-${timestamp}-${random}`;
    }
    async create(clientId, createDto) {
        const service = await this.serviceRepository.findOne({
            where: { id: createDto.serviceId },
            relations: ['provider'],
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const eventDate = new Date(createDto.eventDate);
        const isAvailable = await this.availabilityService.checkAvailability(createDto.serviceId, eventDate, createDto.startTime, createDto.endTime);
        if (!isAvailable) {
            throw new common_1.BadRequestException('Selected date/time is not available');
        }
        let subtotal = Number(service.basePrice);
        if (createDto.packageId) {
        }
        const total = subtotal - (createDto.discount || 0);
        const booking = this.bookingRepository.create({
            bookingNumber: this.generateBookingNumber(),
            serviceId: createDto.serviceId,
            packageId: createDto.packageId,
            clientId,
            providerId: service.providerId,
            eventDate,
            startTime: createDto.startTime,
            endTime: createDto.endTime,
            guestCount: createDto.guestCount,
            notes: createDto.notes,
            source: booking_entity_1.BookingSource.MARKETPLACE,
            status: booking_entity_1.BookingStatus.PENDING,
            subtotal,
            discount: createDto.discount || 0,
            total,
            depositAmount: createDto.depositAmount,
        });
        await this.bookingRepository.save(booking);
        await this.notificationsService.create(service.provider.userId, notification_entity_1.NotificationType.BOOKING_CREATED, 'New Booking Request', `You have a new booking request for ${service.name}`, { bookingId: booking.id });
        return booking;
    }
    async createManual(providerId, createDto) {
        const service = await this.serviceRepository.findOne({
            where: { id: createDto.serviceId, providerId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const subtotal = Number(service.basePrice);
        const total = subtotal - (createDto.discount || 0);
        const booking = this.bookingRepository.create({
            bookingNumber: this.generateBookingNumber(),
            serviceId: createDto.serviceId,
            packageId: createDto.packageId,
            clientId: createDto.clientId || null,
            providerId,
            eventDate: new Date(createDto.eventDate),
            startTime: createDto.startTime,
            endTime: createDto.endTime,
            guestCount: createDto.guestCount,
            notes: createDto.notes,
            clientName: createDto.clientName,
            clientEmail: createDto.clientEmail,
            clientPhone: createDto.clientPhone,
            source: booking_entity_1.BookingSource.SAAS,
            status: booking_entity_1.BookingStatus.CONFIRMED,
            subtotal,
            discount: createDto.discount || 0,
            total,
        });
        return this.bookingRepository.save(booking);
    }
    async findById(id) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['service', 'service.images', 'provider', 'provider.user', 'client', 'package'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async findByClient(clientId, page = 1, limit = 10, status) {
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
    async findByProvider(providerId, page = 1, limit = 10, status, startDate, endDate) {
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
    async confirm(id, providerId) {
        const booking = await this.findById(id);
        if (booking.providerId !== providerId) {
            throw new common_1.ForbiddenException('You do not have access to this booking');
        }
        if (booking.status !== booking_entity_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be confirmed');
        }
        booking.status = booking_entity_1.BookingStatus.CONFIRMED;
        await this.bookingRepository.save(booking);
        if (booking.clientId) {
            await this.notificationsService.create(booking.clientId, notification_entity_1.NotificationType.BOOKING_CONFIRMED, 'Booking Confirmed', `Your booking for ${booking.service.name} has been confirmed`, { bookingId: booking.id });
        }
        return booking;
    }
    async reject(id, providerId, reason) {
        const booking = await this.findById(id);
        if (booking.providerId !== providerId) {
            throw new common_1.ForbiddenException('You do not have access to this booking');
        }
        if (booking.status !== booking_entity_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be rejected');
        }
        booking.status = booking_entity_1.BookingStatus.CANCELLED;
        booking.cancelledBy = booking_entity_1.CancelledBy.PROVIDER;
        booking.cancellationReason = reason || 'Provider rejected the booking';
        booking.cancelledAt = new Date();
        await this.bookingRepository.save(booking);
        if (booking.clientId) {
            await this.notificationsService.create(booking.clientId, notification_entity_1.NotificationType.BOOKING_CANCELLED, 'Booking Cancelled', `Your booking for ${booking.service.name} was cancelled by the provider`, { bookingId: booking.id });
        }
        return booking;
    }
    async cancel(id, userId, cancelledBy, reason) {
        const booking = await this.findById(id);
        if (cancelledBy === booking_entity_1.CancelledBy.CLIENT && booking.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this booking');
        }
        if ([booking_entity_1.BookingStatus.COMPLETED, booking_entity_1.BookingStatus.CANCELLED].includes(booking.status)) {
            throw new common_1.BadRequestException('This booking cannot be cancelled');
        }
        booking.status = booking_entity_1.BookingStatus.CANCELLED;
        booking.cancelledBy = cancelledBy;
        booking.cancellationReason = reason || '';
        booking.cancelledAt = new Date();
        await this.bookingRepository.save(booking);
        return booking;
    }
    async complete(id, providerId) {
        const booking = await this.findById(id);
        if (booking.providerId !== providerId) {
            throw new common_1.ForbiddenException('You do not have access to this booking');
        }
        if (booking.status !== booking_entity_1.BookingStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed bookings can be completed');
        }
        booking.status = booking_entity_1.BookingStatus.COMPLETED;
        await this.bookingRepository.save(booking);
        await this.providerRepository.increment({ id: providerId }, 'totalBookings', 1);
        await this.providerRepository.increment({ id: providerId }, 'totalRevenue', Number(booking.total));
        if (booking.clientId) {
            await this.notificationsService.create(booking.clientId, notification_entity_1.NotificationType.BOOKING_COMPLETED, 'Booking Completed', `Your booking for ${booking.service.name} has been completed. Please leave a review!`, { bookingId: booking.id });
        }
        return booking;
    }
    async markNoShow(id, providerId) {
        const booking = await this.findById(id);
        if (booking.providerId !== providerId) {
            throw new common_1.ForbiddenException('You do not have access to this booking');
        }
        booking.status = booking_entity_1.BookingStatus.NO_SHOW;
        return this.bookingRepository.save(booking);
    }
    async getCalendarEvents(providerId, startDate, endDate) {
        return this.bookingRepository.find({
            where: {
                providerId,
                eventDate: (0, typeorm_2.Between)(startDate, endDate),
                status: booking_entity_1.BookingStatus.CONFIRMED,
            },
            relations: ['service', 'client'],
            order: { eventDate: 'ASC', startTime: 'ASC' },
        });
    }
    async getProviderStats(providerId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [total, pending, confirmed, completed, todayCount] = await Promise.all([
            this.bookingRepository.count({ where: { providerId } }),
            this.bookingRepository.count({
                where: { providerId, status: booking_entity_1.BookingStatus.PENDING },
            }),
            this.bookingRepository.count({
                where: { providerId, status: booking_entity_1.BookingStatus.CONFIRMED },
            }),
            this.bookingRepository.count({
                where: { providerId, status: booking_entity_1.BookingStatus.COMPLETED },
            }),
            this.bookingRepository.count({
                where: {
                    providerId,
                    eventDate: (0, typeorm_2.Between)(today, tomorrow),
                    status: booking_entity_1.BookingStatus.CONFIRMED,
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
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(2, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        availability_service_1.AvailabilityService,
        notifications_service_1.NotificationsService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map