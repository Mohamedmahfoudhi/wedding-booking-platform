"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slugify_1 = require("slugify");
const category_entity_1 = require("../../database/entities/category.entity");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async create(createDto) {
        const slug = (0, slugify_1.default)(createDto.name, { lower: true, strict: true });
        const existingCategory = await this.categoryRepository.findOne({
            where: { slug },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        const category = this.categoryRepository.create({
            ...createDto,
            slug,
        });
        return this.categoryRepository.save(category);
    }
    async findAll(activeOnly = true) {
        const query = this.categoryRepository
            .createQueryBuilder('category')
            .loadRelationCountAndMap('category.serviceCount', 'category.services', 'service', (qb) => qb.where('service.status = :status AND service.isActive = :isActive', {
            status: 'approved',
            isActive: true,
        }));
        if (activeOnly) {
            query.where('category.isActive = :isActive', { isActive: true });
        }
        return query.orderBy('category.displayOrder', 'ASC').getMany();
    }
    async findBySlug(slug) {
        const category = await this.categoryRepository.findOne({
            where: { slug, isActive: true },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async findById(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async update(id, updateDto) {
        const category = await this.findById(id);
        if (updateDto.name && updateDto.name !== category.name) {
            const newSlug = (0, slugify_1.default)(updateDto.name, { lower: true, strict: true });
            const existingCategory = await this.categoryRepository.findOne({
                where: { slug: newSlug },
            });
            if (existingCategory && existingCategory.id !== id) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
            updateDto.slug = newSlug;
        }
        Object.assign(category, updateDto);
        return this.categoryRepository.save(category);
    }
    async delete(id) {
        const category = await this.findById(id);
        await this.categoryRepository.remove(category);
    }
    async toggleActive(id) {
        const category = await this.findById(id);
        category.isActive = !category.isActive;
        return this.categoryRepository.save(category);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map