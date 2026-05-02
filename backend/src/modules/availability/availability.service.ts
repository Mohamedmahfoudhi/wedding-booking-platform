import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Availability } from '../../database/entities/availability.entity';
import { BlockedDate } from '../../database/entities/blocked-date.entity';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { Service } from '../../database/entities/service.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(BlockedDate)
    private readonly blockedDateRepository: Repository<BlockedDate>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getWeeklySchedule(serviceId: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { serviceId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async setWeeklySchedule(
    serviceId: string,
    schedule: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[],
  ): Promise<Availability[]> {
    // Verify service exists
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete existing schedule
    await this.availabilityRepository.delete({ serviceId });

    // Create new schedule
    const availability = schedule.map((slot) =>
      this.availabilityRepository.create({
        serviceId,
        ...slot,
      }),
    );

    return this.availabilityRepository.save(availability);
  }

  async getBlockedDates(
    serviceId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BlockedDate[]> {
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

  async blockDate(
    serviceId: string,
    date: Date,
    reason?: string,
  ): Promise<BlockedDate> {
    const blockedDate = this.blockedDateRepository.create({
      serviceId,
      date,
      reason,
    });

    return this.blockedDateRepository.save(blockedDate);
  }

  async blockDates(
    serviceId: string,
    dates: { date: Date; reason?: string }[],
  ): Promise<BlockedDate[]> {
    const blockedDates = dates.map((d) =>
      this.blockedDateRepository.create({
        serviceId,
        date: d.date,
        reason: d.reason,
      }),
    );

    return this.blockedDateRepository.save(blockedDates);
  }

  async unblockDate(serviceId: string, blockedDateId: string): Promise<void> {
    await this.blockedDateRepository.delete({
      id: blockedDateId,
      serviceId,
    });
  }

  async checkAvailability(
    serviceId: string,
    date: Date,
    startTime?: string,
    endTime?: string,
  ): Promise<boolean> {
    // Check if date is blocked
    const blockedDate = await this.blockedDateRepository.findOne({
      where: { serviceId, date },
    });

    if (blockedDate) {
      return false;
    }

    // Check weekly schedule
    const dayOfWeek = new Date(date).getDay();
    const schedule = await this.availabilityRepository.findOne({
      where: { serviceId, dayOfWeek },
    });

    if (!schedule || !schedule.isAvailable) {
      return false;
    }

    // Check for existing bookings
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        serviceId,
        eventDate: date,
        status: BookingStatus.CONFIRMED,
      },
    });

    if (existingBooking) {
      // If times overlap, not available
      if (startTime && endTime && existingBooking.startTime && existingBooking.endTime) {
        const newStart = this.timeToMinutes(startTime);
        const newEnd = this.timeToMinutes(endTime);
        const existingStart = this.timeToMinutes(existingBooking.startTime);
        const existingEnd = this.timeToMinutes(existingBooking.endTime);

        if (newStart < existingEnd && newEnd > existingStart) {
          return false;
        }
      } else {
        // If no times specified, date is booked
        return false;
      }
    }

    return true;
  }

  async getAvailableDates(
    serviceId: string,
    month: number,
    year: number,
  ): Promise<{ date: string; available: boolean }[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get blocked dates for the month
    const blockedDates = await this.blockedDateRepository.find({
      where: {
        serviceId,
        date: Between(startDate, endDate),
      },
    });

    const blockedSet = new Set(
      blockedDates.map((b) => b.date.toISOString().split('T')[0]),
    );

    // Get confirmed bookings for the month
    const bookings = await this.bookingRepository.find({
      where: {
        serviceId,
        eventDate: Between(startDate, endDate),
        status: BookingStatus.CONFIRMED,
      },
    });

    const bookedSet = new Set(
      bookings.map((b) => new Date(b.eventDate).toISOString().split('T')[0]),
    );

    // Get weekly schedule
    const schedule = await this.availabilityRepository.find({
      where: { serviceId },
    });

    const availableDays = new Set(
      schedule.filter((s) => s.isAvailable).map((s) => s.dayOfWeek),
    );

    // Generate dates for the month
    const dates: { date: string; available: boolean }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const isPast = currentDate < new Date();

      const available =
        !isPast &&
        availableDays.has(dayOfWeek) &&
        !blockedSet.has(dateStr) &&
        !bookedSet.has(dateStr);

      dates.push({ date: dateStr, available });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  async getAvailableTimeSlots(
    serviceId: string,
    date: Date,
  ): Promise<{ start: string; end: string }[]> {
    const dayOfWeek = new Date(date).getDay();

    const schedule = await this.availabilityRepository.findOne({
      where: { serviceId, dayOfWeek },
    });

    if (!schedule || !schedule.isAvailable) {
      return [];
    }

    // Get existing bookings for the date
    const bookings = await this.bookingRepository.find({
      where: {
        serviceId,
        eventDate: date,
        status: BookingStatus.CONFIRMED,
      },
    });

    // For simplicity, return the full schedule time if no bookings
    // In a real app, you'd calculate available time slots based on service duration
    if (bookings.length === 0) {
      return [{ start: schedule.startTime, end: schedule.endTime }];
    }

    // Return empty if fully booked
    return [];
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
