import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    updateAvatar(userId: string, avatarUrl: string): Promise<User>;
    deactivateAccount(userId: string): Promise<void>;
    findAll(page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
    }>;
}
