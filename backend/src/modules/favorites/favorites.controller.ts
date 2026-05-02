import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my favorites' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    const { favorites, total } = await this.favoritesService.findByUser(
      user.id,
      page,
      limit,
    );

    return {
      favorites,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post(':serviceId')
  @ApiOperation({ summary: 'Add to favorites' })
  async add(@CurrentUser() user: User, @Param('serviceId') serviceId: string) {
    const favorite = await this.favoritesService.add(user.id, serviceId);
    return {
      message: 'Added to favorites',
      favorite,
    };
  }

  @Delete(':serviceId')
  @ApiOperation({ summary: 'Remove from favorites' })
  async remove(
    @CurrentUser() user: User,
    @Param('serviceId') serviceId: string,
  ) {
    await this.favoritesService.remove(user.id, serviceId);
    return { message: 'Removed from favorites' };
  }

  @Get(':serviceId/check')
  @ApiOperation({ summary: 'Check if service is in favorites' })
  async check(
    @CurrentUser() user: User,
    @Param('serviceId') serviceId: string,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(user.id, serviceId);
    return { isFavorite };
  }
}
