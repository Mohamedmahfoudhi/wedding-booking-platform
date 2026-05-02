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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { ProvidersService } from '../providers/providers.service';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search services with filters' })
  async search(@Query() filters: ServiceFiltersDto) {
    const { services, total } = await this.servicesService.search(filters);

    return {
      services,
      meta: {
        page: filters.page || 1,
        limit: filters.limit || 12,
        total,
        totalPages: Math.ceil(total / (filters.limit || 12)),
      },
    };
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured services' })
  async getFeatured(@Query('limit') limit = 8) {
    const services = await this.servicesService.getFeatured(limit);
    return { services };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get service details' })
  async findById(@Param('id') id: string) {
    const service = await this.servicesService.findById(id);
    // Increment view count
    await this.servicesService.incrementViewCount(id);
    return { service };
  }
}

@ApiTags('provider/services')
@Controller('provider/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth()
export class ProviderServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly providersService: ProvidersService,
  ) {}

  private async getProviderId(userId: string): Promise<string> {
    const profile = await this.providersService.findByUserId(userId);
    return profile.id;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateServiceDto,
  ) {
    const providerId = await this.getProviderId(user.id);
    const service = await this.servicesService.create(providerId, createDto);
    return {
      message: 'Service created successfully',
      service,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all my services' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const providerId = await this.getProviderId(user.id);
    const { services, total } = await this.servicesService.findByProvider(
      providerId,
      page,
      limit,
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

  @Get(':id')
  @ApiOperation({ summary: 'Get my service details' })
  async findById(@CurrentUser() user: User, @Param('id') id: string) {
    const providerId = await this.getProviderId(user.id);
    const service = await this.servicesService.findByIdForProvider(id, providerId);
    return { service };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my service' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceDto,
  ) {
    const providerId = await this.getProviderId(user.id);
    const service = await this.servicesService.update(id, providerId, updateDto);
    return {
      message: 'Service updated successfully',
      service,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete my service' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    const providerId = await this.getProviderId(user.id);
    await this.servicesService.delete(id, providerId);
    return { message: 'Service deleted successfully' };
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add images to service' })
  async addImages(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { images: { url: string; publicId?: string }[] },
  ) {
    const providerId = await this.getProviderId(user.id);
    const images = await this.servicesService.addImages(id, providerId, body.images);
    return {
      message: 'Images added successfully',
      images,
    };
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete image from service' })
  async deleteImage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    const providerId = await this.getProviderId(user.id);
    await this.servicesService.deleteImage(id, imageId, providerId);
    return { message: 'Image deleted successfully' };
  }

  @Patch(':id/images/:imageId/primary')
  @ApiOperation({ summary: 'Set primary image' })
  async setPrimaryImage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    const providerId = await this.getProviderId(user.id);
    await this.servicesService.setPrimaryImage(id, imageId, providerId);
    return { message: 'Primary image updated' };
  }

  @Post(':id/packages')
  @ApiOperation({ summary: 'Add package to service' })
  async addPackage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() createDto: CreatePackageDto,
  ) {
    const providerId = await this.getProviderId(user.id);
    const pkg = await this.servicesService.addPackage(id, providerId, createDto);
    return {
      message: 'Package added successfully',
      package: pkg,
    };
  }

  @Patch(':id/packages/:packageId')
  @ApiOperation({ summary: 'Update package' })
  async updatePackage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('packageId') packageId: string,
    @Body() updateDto: Partial<CreatePackageDto>,
  ) {
    const providerId = await this.getProviderId(user.id);
    const pkg = await this.servicesService.updatePackage(
      id,
      packageId,
      providerId,
      updateDto,
    );
    return {
      message: 'Package updated successfully',
      package: pkg,
    };
  }

  @Delete(':id/packages/:packageId')
  @ApiOperation({ summary: 'Delete package' })
  async deletePackage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('packageId') packageId: string,
  ) {
    const providerId = await this.getProviderId(user.id);
    await this.servicesService.deletePackage(id, packageId, providerId);
    return { message: 'Package deleted successfully' };
  }
}
