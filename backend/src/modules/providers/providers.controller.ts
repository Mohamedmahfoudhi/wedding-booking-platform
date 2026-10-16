import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@ApiTags('providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as a provider' })
  async register(
    @CurrentUser() user: User,
    @Body() createDto: CreateProviderDto,
  ) {
    const profile = await this.providersService.createProfile(user.id, createDto);
    return {
      message: 'Provider profile created successfully',
      profile,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own provider profile' })
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.providersService.findByUserId(user.id);
    return { profile };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own provider profile' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProviderDto,
  ) {
    const profile = await this.providersService.updateProfile(user.id, updateDto);
    return {
      message: 'Profile updated successfully',
      profile,
    };
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get provider dashboard statistics' })
  async getDashboardStats(@CurrentUser() user: User) {
    const profile = await this.providersService.findByUserId(user.id);
    const stats = await this.providersService.getDashboardStats(profile.id);
    return { stats };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all providers' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('city') city?: string,
    @Query('governorate') governorate?: string,
    @Query('verified') verified?: boolean,
    @Query('featured') featured?: boolean,
  ) {
    const { providers, total } = await this.providersService.findAll(
      page,
      limit,
      { city, governorate, isVerified: verified, isFeatured: featured },
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

  @Public()
  @Get(':slugOrId')
  @ApiOperation({ summary: 'Get provider by slug or id' })
  async findBySlug(@Param('slugOrId') slugOrId: string) {
    const provider = await this.providersService.findBySlugOrId(slugOrId);
    return { provider };
  }
}
