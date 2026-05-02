import { PartialType } from '@nestjs/swagger';
import { CreateProviderDto } from './create-provider.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProviderDto extends PartialType(CreateProviderDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;
}
