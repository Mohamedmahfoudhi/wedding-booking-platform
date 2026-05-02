import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ example: 'Wedding Venue Tunisia' })
  @IsString()
  businessName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Tunis' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Tunis' })
  @IsString()
  @IsOptional()
  governorate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;
}
