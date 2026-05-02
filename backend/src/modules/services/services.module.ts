import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController, ProviderServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from '../../database/entities/service.entity';
import { ServiceImage } from '../../database/entities/service-image.entity';
import { ServicePackage } from '../../database/entities/service-package.entity';
import { ProviderProfile } from '../../database/entities/provider-profile.entity';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceImage, ServicePackage, ProviderProfile]),
    ProvidersModule,
  ],
  controllers: [ServicesController, ProviderServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
