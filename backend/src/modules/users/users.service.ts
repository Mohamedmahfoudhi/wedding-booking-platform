import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(userId);
    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async findAll(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }
}
