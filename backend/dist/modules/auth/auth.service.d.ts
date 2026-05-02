import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly providerProfileRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, providerProfileRepository: Repository<ProviderProfile>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    validateUser(payload: JwtPayload): Promise<User | null>;
    private generateTokens;
    private calculateExpiry;
}
