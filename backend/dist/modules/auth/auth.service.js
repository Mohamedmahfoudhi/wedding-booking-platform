"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const slugify_1 = require("slugify");
const user_entity_1 = require("../../database/entities/user.entity");
const refresh_token_entity_1 = require("../../database/entities/refresh-token.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
let AuthService = class AuthService {
    constructor(userRepository, refreshTokenRepository, providerProfileRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone, role, businessName, businessDescription } = registerDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = (0, uuid_1.v4)();
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: role || user_entity_1.UserRole.CLIENT,
            verificationToken,
            isVerified: false,
        });
        await this.userRepository.save(user);
        if (role === user_entity_1.UserRole.PROVIDER && businessName) {
            const baseSlug = (0, slugify_1.default)(businessName, { lower: true, strict: true });
            let slug = baseSlug;
            let counter = 1;
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
        const tokens = await this.generateTokens(user);
        delete user.password;
        delete user.verificationToken;
        return { user, tokens };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        delete user.password;
        delete user.verificationToken;
        return { user, tokens };
    }
    async refreshTokens(refreshToken) {
        const tokenRecord = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, isRevoked: false },
            relations: ['user'],
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (new Date() > tokenRecord.expiresAt) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        tokenRecord.isRevoked = true;
        await this.refreshTokenRepository.save(tokenRecord);
        return this.generateTokens(tokenRecord.user);
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.refreshTokenRepository.update({ userId, token: refreshToken }, { isRevoked: true });
        }
        else {
            await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
        }
    }
    async verifyEmail(token) {
        const user = await this.userRepository.findOne({
            where: { verificationToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        user.isVerified = true;
        user.verificationToken = '';
        await this.userRepository.save(user);
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return;
        }
        const resetToken = (0, uuid_1.v4)();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await this.userRepository.save(user);
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Reset token expired');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = '';
        user.resetPasswordExpires = null;
        await this.userRepository.save(user);
        await this.refreshTokenRepository.update({ userId: user.id, isRevoked: false }, { isRevoked: true });
    }
    async validateUser(payload) {
        return this.userRepository.findOne({
            where: { id: payload.sub, isActive: true },
        });
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = (0, uuid_1.v4)();
        const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
        const expiresAt = this.calculateExpiry(expiresIn);
        const tokenRecord = this.refreshTokenRepository.create({
            userId: user.id,
            token: refreshToken,
            expiresAt,
        });
        await this.refreshTokenRepository.save(tokenRecord);
        return { accessToken, refreshToken };
    }
    calculateExpiry(duration) {
        const now = new Date();
        const match = duration.match(/^(\d+)([dhms])$/);
        if (!match) {
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __param(2, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map