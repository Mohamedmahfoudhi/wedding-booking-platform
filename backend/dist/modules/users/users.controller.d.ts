import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: User): Promise<{
        user: User;
    }>;
    updateProfile(user: User, updateDto: UpdateProfileDto): Promise<{
        message: string;
        user: User;
    }>;
    changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deactivateAccount(user: User): Promise<{
        message: string;
    }>;
}
