import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Salles des Fêtes' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'قاعات الأفراح' })
  @IsString()
  @IsOptional()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'pi-building' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
