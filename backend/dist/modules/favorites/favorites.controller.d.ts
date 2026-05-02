import { FavoritesService } from './favorites.service';
import { User } from '../../database/entities/user.entity';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    findAll(user: User, page?: number, limit?: number): Promise<{
        favorites: import("../../database/entities").Favorite[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    add(user: User, serviceId: string): Promise<{
        message: string;
        favorite: import("../../database/entities").Favorite;
    }>;
    remove(user: User, serviceId: string): Promise<{
        message: string;
    }>;
    check(user: User, serviceId: string): Promise<{
        isFavorite: boolean;
    }>;
}
