import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriceType } from '../../../database/entities/service.entity';

export class CreateServiceDto {
  @ApiProperty({ example: 'Elegant Wedding Venue' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ enum: PriceType, default: PriceType.FIXED })
  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @ApiPropertyOptional({ example: 240 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  capacityMin?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  capacityMax?: number;
}
