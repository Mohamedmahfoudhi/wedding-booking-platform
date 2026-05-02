"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const providers_module_1 = require("./modules/providers/providers.module");
const categories_module_1 = require("./modules/categories/categories.module");
const services_module_1 = require("./modules/services/services.module");
const availability_module_1 = require("./modules/availability/availability.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const payments_module_1 = require("./modules/payments/payments.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const favorites_module_1 = require("./modules/favorites/favorites.module");
const messages_module_1 = require("./modules/messages/messages.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const upload_module_1 = require("./modules/upload/upload.module");
const admin_module_1 = require("./modules/admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
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
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            providers_module_1.ProvidersModule,
            categories_module_1.CategoriesModule,
            services_module_1.ServicesModule,
            availability_module_1.AvailabilityModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            reviews_module_1.ReviewsModule,
            favorites_module_1.FavoritesModule,
            messages_module_1.MessagesModule,
            notifications_module_1.NotificationsModule,
            upload_module_1.UploadModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map