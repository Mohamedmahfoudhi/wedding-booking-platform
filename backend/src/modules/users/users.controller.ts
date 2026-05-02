import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    return { user };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, updateDto);
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate account' })
  async deactivateAccount(@CurrentUser() user: User) {
    await this.usersService.deactivateAccount(user.id);
    return { message: 'Account deactivated successfully' };
  }
}
