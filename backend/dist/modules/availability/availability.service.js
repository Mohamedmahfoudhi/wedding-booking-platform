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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const availability_entity_1 = require("../../database/entities/availability.entity");
const blocked_date_entity_1 = require("../../database/entities/blocked-date.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const service_entity_1 = require("../../database/entities/service.entity");
let AvailabilityService = class AvailabilityService {
    constructor(availabilityRepository, blockedDateRepository, bookingRepository, serviceRepository) {
        this.availabilityRepository = availabilityRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
    }
    async getWeeklySchedule(serviceId) {
        return this.availabilityRepository.find({
            where: { serviceId },
            order: { dayOfWeek: 'ASC' },
        });
    }
    async setWeeklySchedule(serviceId, schedule) {
        const service = await this.serviceRepository.findOne({
            where: { id: serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        await this.availabilityRepository.delete({ serviceId });
        const availability = schedule.map((slot) => this.availabilityRepository.create({
            serviceId,
            ...slot,
        }));
        return this.availabilityRepository.save(availability);
    }
    async getBlockedDates(serviceId, startDate, endDate) {
        const query = this.blockedDateRepository.createQueryBuilder('blocked')
            .where('blocked.serviceId = :serviceId', { serviceId });
        if (startDate && endDate) {
            query.andWhere('blocked.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        return query.orderBy('blocked.date', 'ASC').getMany();
    }
    async blockDate(serviceId, date, reason) {
        const blockedDate = this.blockedDateRepository.create({
            serviceId,
            date,
            reason,
        });
        return this.blockedDateRepository.save(blockedDate);
    }
    async blockDates(serviceId, dates) {
        const blockedDates = dates.map((d) => this.blockedDateRepository.create({
            serviceId,
            date: d.date,
            reason: d.reason,
        }));
        return this.blockedDateRepository.save(blockedDates);
    }
    async unblockDate(serviceId, blockedDateId) {
        await this.blockedDateRepository.delete({
            id: blockedDateId,
            serviceId,
        });
    }
    async checkAvailability(serviceId, date, startTime, endTime) {
        const blockedDate = await this.blockedDateRepository.findOne({
            where: { serviceId, date },
        });
        if (blockedDate) {
            return false;
        }
        const dayOfWeek = new Date(date).getDay();
        const schedule = await this.availabilityRepository.findOne({
            where: { serviceId, dayOfWeek },
        });
        if (!schedule || !schedule.isAvailable) {
            return false;
        }
        const existingBooking = await this.bookingRepository.findOne({
            where: {
                serviceId,
                eventDate: date,
                status: booking_entity_1.BookingStatus.CONFIRMED,
            },
        });
        if (existingBooking) {
            if (startTime && endTime && existingBooking.startTime && existingBooking.endTime) {
                const newStart = this.timeToMinutes(startTime);
                const newEnd = this.timeToMinutes(endTime);
                const existingStart = this.timeToMinutes(existingBooking.startTime);
                const existingEnd = this.timeToMinutes(existingBooking.endTime);
                if (newStart < existingEnd && newEnd > existingStart) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    async getAvailableDates(serviceId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const blockedDates = await this.blockedDateRepository.find({
            where: {
                serviceId,
                date: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const blockedSet = new Set(blockedDates.map((b) => b.date.toISOString().split('T')[0]));
        const bookings = await this.bookingRepository.find({
            where: {
                serviceId,
                eventDate: (0, typeorm_2.Between)(startDate, endDate),
                status: booking_entity_1.BookingStatus.CONFIRMED,
            },
        });
        const bookedSet = new Set(bookings.map((b) => new Date(b.eventDate).toISOString().split('T')[0]));
        const schedule = await this.availabilityRepository.find({
            where: { serviceId },
        });
        const availableDays = new Set(schedule.filter((s) => s.isAvailable).map((s) => s.dayOfWeek));
        const dates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();
            const isPast = currentDate < new Date();
            const available = !isPast &&
                availableDays.has(dayOfWeek) &&
                !blockedSet.has(dateStr) &&
                !bookedSet.has(dateStr);
            dates.push({ date: dateStr, available });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }
    async getAvailableTimeSlots(serviceId, date) {
        const dayOfWeek = new Date(date).getDay();
        const schedule = await this.availabilityRepository.findOne({
            where: { serviceId, dayOfWeek },
        });
        if (!schedule || !schedule.isAvailable) {
            return [];
        }
        const bookings = await this.bookingRepository.find({
            where: {
                serviceId,
                eventDate: date,
                status: booking_entity_1.BookingStatus.CONFIRMED,
            },
        });
        if (bookings.length === 0) {
            return [{ start: schedule.startTime, end: schedule.endTime }];
        }
        return [];
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __param(1, (0, typeorm_1.InjectRepository)(blocked_date_entity_1.BlockedDate)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map