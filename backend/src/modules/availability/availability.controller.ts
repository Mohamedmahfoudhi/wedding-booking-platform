import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../database/entities/user.entity';

@ApiTags('availability')
@Controller('services/:serviceId/availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get service availability schedule' })
  async getSchedule(@Param('serviceId') serviceId: string) {
    const schedule = await this.availabilityService.getWeeklySchedule(serviceId);
    return { schedule };
  }

  @Public()
  @Get('dates')
  @ApiOperation({ summary: 'Get available dates for a month' })
  async getAvailableDates(
    @Param('serviceId') serviceId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    const dates = await this.availabilityService.getAvailableDates(
      serviceId,
      month,
      year,
    );
    return { dates };
  }

  @Public()
  @Get('times')
  @ApiOperation({ summary: 'Get available time slots for a date' })
  async getAvailableTimeSlots(
    @Param('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    const slots = await this.availabilityService.getAvailableTimeSlots(
      serviceId,
      new Date(date),
    );
    return { slots };
  }

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Check if specific date/time is available' })
  async checkAvailability(
    @Param('serviceId') serviceId: string,
    @Query('date') date: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const available = await this.availabilityService.checkAvailability(
      serviceId,
      new Date(date),
      startTime,
      endTime,
    );
    return { available };
  }
}

@ApiTags('provider/availability')
@Controller('provider/services/:serviceId/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth()
export class ProviderAvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get service availability settings' })
  async getSchedule(@Param('serviceId') serviceId: string) {
    const schedule = await this.availabilityService.getWeeklySchedule(serviceId);
    return { schedule };
  }

  @Put()
  @ApiOperation({ summary: 'Set weekly schedule' })
  async setSchedule(
    @Param('serviceId') serviceId: string,
    @Body() body: {
      schedule: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
      }[];
    },
  ) {
    const schedule = await this.availabilityService.setWeeklySchedule(
      serviceId,
      body.schedule,
    );
    return {
      message: 'Schedule updated successfully',
      schedule,
    };
  }

  @Get('blocked-dates')
  @ApiOperation({ summary: 'Get blocked dates' })
  async getBlockedDates(
    @Param('serviceId') serviceId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const blockedDates = await this.availabilityService.getBlockedDates(
      serviceId,
      start ? new Date(start) : undefined,
      end ? new Date(end) : undefined,
    );
    return { blockedDates };
  }

  @Post('blocked-dates')
  @ApiOperation({ summary: 'Block dates' })
  async blockDates(
    @Param('serviceId') serviceId: string,
    @Body() body: { dates: { date: string; reason?: string }[] },
  ) {
    const blockedDates = await this.availabilityService.blockDates(
      serviceId,
      body.dates.map((d) => ({ date: new Date(d.date), reason: d.reason })),
    );
    return {
      message: 'Dates blocked successfully',
      blockedDates,
    };
  }

  @Delete('blocked-dates/:blockedDateId')
  @ApiOperation({ summary: 'Unblock a date' })
  async unblockDate(
    @Param('serviceId') serviceId: string,
    @Param('blockedDateId') blockedDateId: string,
  ) {
    await this.availabilityService.unblockDate(serviceId, blockedDateId);
    return { message: 'Date unblocked successfully' };
  }
}
