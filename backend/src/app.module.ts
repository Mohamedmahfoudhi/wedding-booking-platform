import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServicesModule } from './modules/services/services.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('DATABASE_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProvidersModule,
    CategoriesModule,
    ServicesModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    FavoritesModule,
    MessagesModule,
    NotificationsModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
