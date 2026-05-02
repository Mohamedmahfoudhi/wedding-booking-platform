import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SortBy {
  PRICE = 'price',
  RATING = 'rating',
  REVIEWS = 'reviews',
  NEWEST = 'newest',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ServiceFiltersDto {
  @ApiPropertyOptional({ description: 'Category slug' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  governorate?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMin?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMax?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  ratingMin?: number;

  @ApiPropertyOptional({ description: 'Check availability for date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ enum: SortBy })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 12 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}
