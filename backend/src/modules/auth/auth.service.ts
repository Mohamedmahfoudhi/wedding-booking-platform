import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, firstName, lastName, phone, role, businessName, businessDescription } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || UserRole.CLIENT,
      verificationToken,
      isVerified: false,
    });

    await this.userRepository.save(user);

    // Create provider profile if registering as provider
    if (role === UserRole.PROVIDER && businessName) {
      const baseSlug = slugify(businessName, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await this.providerProfileRepository.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const providerProfile = this.providerProfileRepository.create({
        userId: user.id,
        businessName,
        slug,
        description: businessDescription,
      });

      await this.providerProfileRepository.save(providerProfile);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove sensitive data
    delete (user as Partial<User>).password;
    delete (user as Partial<User>).verificationToken;

    return { user, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove sensitive data
    delete (user as Partial<User>).password;
    delete (user as Partial<User>).verificationToken;

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Find refresh token
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if expired
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old token
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Generate new tokens
    return this.generateTokens(tokenRecord.user);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific token
      await this.refreshTokenRepository.update(
        { userId, token: refreshToken },
        { isRevoked: true },
      );
    } else {
      // Revoke all tokens for user
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = '';
    await this.userRepository.save(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);

    // TODO: Send email with reset link
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Reset token expired');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null as unknown as Date;
    await this.userRepository.save(user);

    // Revoke all refresh tokens
    await this.refreshTokenRepository.update(
      { userId: user.id, isRevoked: false },
      { isRevoked: true },
    );
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = uuidv4();
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
    const expiresAt = this.calculateExpiry(expiresIn);

    // Save refresh token
    const tokenRecord = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenRecord);

    return { accessToken, refreshToken };
  }

  private calculateExpiry(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 's':
        return new Date(now.getTime() + value * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}
