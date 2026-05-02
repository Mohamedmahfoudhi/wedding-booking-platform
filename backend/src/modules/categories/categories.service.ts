import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createDto: CreateCategoryDto): Promise<Category> {
    // Generate slug
    const slug = slugify(createDto.name, { lower: true, strict: true });

    // Check if slug exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      ...createDto,
      slug,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(activeOnly = true): Promise<Category[]> {
    const query = this.categoryRepository.createQueryBuilder('category');

    if (activeOnly) {
      query.where('category.isActive = :isActive', { isActive: true });
    }

    return query.orderBy('category.displayOrder', 'ASC').getMany();
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    // If updating name, update slug
    if (updateDto.name && updateDto.name !== category.name) {
      const newSlug = slugify(updateDto.name, { lower: true, strict: true });
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: newSlug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }

      (updateDto as Partial<Category>).slug = newSlug;
    }

    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoryRepository.remove(category);
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.findById(id);
    category.isActive = !category.isActive;
    return this.categoryRepository.save(category);
  }
}
