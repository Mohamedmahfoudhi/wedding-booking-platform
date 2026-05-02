import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../database/entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async add(userId: string, serviceId: string): Promise<Favorite> {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, serviceId },
    });

    if (existing) {
      throw new ConflictException('Service already in favorites');
    }

    const favorite = this.favoriteRepository.create({ userId, serviceId });
    return this.favoriteRepository.save(favorite);
  }

  async remove(userId: string, serviceId: string): Promise<void> {
    await this.favoriteRepository.delete({ userId, serviceId });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 12,
  ): Promise<{ favorites: Favorite[]; total: number }> {
    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: ['service', 'service.images', 'service.provider', 'service.category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { favorites, total };
  }

  async isFavorite(userId: string, serviceId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({
      where: { userId, serviceId },
    });
    return count > 0;
  }

  async checkFavorites(
    userId: string,
    serviceIds: string[],
  ): Promise<Record<string, boolean>> {
    const favorites = await this.favoriteRepository.find({
      where: serviceIds.map((serviceId) => ({ userId, serviceId })),
    });

    const favoriteSet = new Set(favorites.map((f) => f.serviceId));
    return serviceIds.reduce(
      (acc, id) => {
        acc[id] = favoriteSet.has(id);
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }
}
