import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active categories' })
  async findAll() {
    const categories = await this.categoriesService.findAll(true);
    return { categories };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return { category };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (Admin only)' })
  async create(@Body() createDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createDto);
    return {
      message: 'Category created successfully',
      category,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (Admin only)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, updateDto);
    return {
      message: 'Category updated successfully',
      category,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.categoriesService.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
