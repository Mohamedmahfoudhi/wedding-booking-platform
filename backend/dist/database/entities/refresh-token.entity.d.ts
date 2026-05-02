import { User } from './user.entity';
export declare class RefreshToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    user: User;
}
