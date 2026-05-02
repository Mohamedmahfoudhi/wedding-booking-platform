import { IsEmail, IsString, MinLength, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+216 XX XXX XXX' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CLIENT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'My Wedding Services' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  businessName?: string;

  @ApiPropertyOptional({ example: 'We provide the best wedding services...' })
  @IsString()
  @IsOptional()
  businessDescription?: string;
}
