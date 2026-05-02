import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { User } from '../../database/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
        user: User;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
        user: User;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    logout(user: User, body: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getCurrentUser(user: User): Promise<{
        user: User;
    }>;
}
