import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Premium Package' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 7500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: ['Photography', 'Video', 'Album'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;
}
