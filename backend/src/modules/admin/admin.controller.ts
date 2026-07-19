import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { ServiceStatus } from '../../database/entities/service.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    const stats = await this.adminService.getDashboardStats();
    return { stats };
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Get revenue chart data' })
  async getRevenueChart(@Query('months') monthsParam = '12') {
    const months = parseInt(monthsParam, 10) || 12;
    const data = await this.adminService.getRevenueChart(months);
    return { data };
  }

  // Users
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getUsers(
    @Query('page') pageParam = '1',
    @Query('limit') limitParam = '10',
    @Query('role') roleParam?: string,
    @Query('search') search?: string,
  ) {
    const page = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam, 10) || 10;

    // Only use role if it's a valid enum value
    const validRoles = Object.values(UserRole);
    const role = roleParam && validRoles.includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : undefined;

    const { users, total } = await this.adminService.getUsers(
      page,
      limit,
      role,
      search,
    );

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; role?: UserRole },
  ) {
    const user = await this.adminService.updateUser(id, body);
    return { message: 'User updated', user };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
    return { message: 'User deleted' };
  }

  // Providers
  @Get('providers')
  @ApiOperation({ summary: 'List all providers' })
  async getProviders(
    @Query('page') pageParam = '1',
    @Query('limit') limitParam = '10',
    @Query('verified') verified?: string,
    @Query('search') search?: string,
  ) {
    const page = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam, 10) || 10;
    const isVerified = verified === 'true' ? true : verified === 'false' ? false : undefined;

    const { providers, total } = await this.adminService.getProviders(
      page,
      limit,
      isVerified,
      search,
    );

    return {
      providers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch('providers/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify/unverify provider' })
  async verifyProvider(
    @Param('id') id: string,
    @Body() body: { verified: boolean },
  ) {
    const provider = await this.adminService.verifyProvider(id, body.verified);
    return { message: 'Provider updated', provider };
  }

  @Patch('providers/:id/feature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature/unfeature provider' })
  async featureProvider(
    @Param('id') id: string,
    @Body() body: { featured: boolean },
  ) {
    const provider = await this.adminService.featureProvider(id, body.featured);
    return { message: 'Provider updated', provider };
  }

  // Services
  @Get('services')
  @ApiOperation({ summary: 'List all services' })
  async getServices(
    @Query('page') pageParam = '1',
    @Query('limit') limitParam = '10',
    @Query('status') status?: ServiceStatus,
    @Query('categoryId') categoryId?: string,
    @Query('category') categorySlug?: string,
  ) {
    const page = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam, 10) || 10;

    const { services, total } = await this.adminService.getServices(
      page,
      limit,
      status,
      categoryId,
      categorySlug,
    );

    return {
      services,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post('services/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve service' })
  async approveService(@Param('id') id: string) {
    const service = await this.adminService.approveService(id);
    return { message: 'Service approved', service };
  }

  @Post('services/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject service' })
  async rejectService(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const service = await this.adminService.rejectService(id, body.reason);
    return { message: 'Service rejected', service };
  }

  @Patch('services/:id/feature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature/unfeature service' })
  async featureService(
    @Param('id') id: string,
    @Body() body: { featured: boolean },
  ) {
    const service = await this.adminService.featureService(id, body.featured);
    return { message: 'Service updated', service };
  }

  @Patch('services/:id/toggle-featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle service featured status' })
  async toggleFeatured(@Param('id') id: string) {
    const service = await this.adminService.toggleFeatured(id);
    return { message: 'Service updated', service };
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Delete service' })
  async deleteService(@Param('id') id: string) {
    await this.adminService.deleteService(id);
    return { message: 'Service deleted' };
  }

  // Reviews
  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  async getReviews(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const { reviews, total } = await this.adminService.getReviews(page, limit);

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch('reviews/:id/visibility')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle review visibility' })
  async toggleReviewVisibility(@Param('id') id: string) {
    const review = await this.adminService.toggleReviewVisibility(id);
    return { message: 'Review updated', review };
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete review' })
  async deleteReview(@Param('id') id: string) {
    await this.adminService.deleteReview(id);
    return { message: 'Review deleted' };
  }
}
