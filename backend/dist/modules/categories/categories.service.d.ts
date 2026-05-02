import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(createDto: CreateCategoryDto): Promise<Category>;
    findAll(activeOnly?: boolean): Promise<Category[]>;
    findBySlug(slug: string): Promise<Category>;
    findById(id: string): Promise<Category>;
    update(id: string, updateDto: UpdateCategoryDto): Promise<Category>;
    delete(id: string): Promise<void>;
    toggleActive(id: string): Promise<Category>;
}
