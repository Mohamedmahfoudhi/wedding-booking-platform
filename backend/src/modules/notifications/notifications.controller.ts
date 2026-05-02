import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { notifications, total } = await this.notificationsService.findByUser(
      user.id,
      page,
      limit,
    );

    return {
      notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    await this.notificationsService.markAsRead(id, user.id);
    return { message: 'Marked as read' };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    await this.notificationsService.delete(id, user.id);
    return { message: 'Notification deleted' };
  }
}
