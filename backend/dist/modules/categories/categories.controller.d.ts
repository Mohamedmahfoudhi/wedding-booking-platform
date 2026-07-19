import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        categories: (import("../../database/entities").Category & {
            serviceCount: number;
        })[];
    }>;
    findBySlug(slug: string): Promise<{
        category: import("../../database/entities").Category;
    }>;
    create(createDto: CreateCategoryDto): Promise<{
        message: string;
        category: import("../../database/entities").Category;
    }>;
    update(id: string, updateDto: UpdateCategoryDto): Promise<{
        message: string;
        category: import("../../database/entities").Category;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
