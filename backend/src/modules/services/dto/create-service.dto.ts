import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriceType } from '../../../database/entities/service.entity';

export class ServiceImageDto {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  publicId?: string;
}

export class ServicePackageDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;
}

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

  @ApiPropertyOptional({ example: 'Tunis' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ type: [ServiceImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceImageDto)
  @IsOptional()
  images?: ServiceImageDto[];

  @ApiPropertyOptional({ type: [ServicePackageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePackageDto)
  @IsOptional()
  packages?: ServicePackageDto[];
}
