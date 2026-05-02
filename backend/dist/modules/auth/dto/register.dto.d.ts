import { UserRole } from '../../../database/entities/user.entity';
export declare class RegisterDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: UserRole;
    businessName?: string;
    businessDescription?: string;
}
