import { Repository } from 'typeorm';
import { Favorite } from '../../database/entities/favorite.entity';
export declare class FavoritesService {
    private readonly favoriteRepository;
    constructor(favoriteRepository: Repository<Favorite>);
    add(userId: string, serviceId: string): Promise<Favorite>;
    remove(userId: string, serviceId: string): Promise<void>;
    findByUser(userId: string, page?: number, limit?: number): Promise<{
        favorites: Favorite[];
        total: number;
    }>;
    isFavorite(userId: string, serviceId: string): Promise<boolean>;
    checkFavorites(userId: string, serviceIds: string[]): Promise<Record<string, boolean>>;
}
