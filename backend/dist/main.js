"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    if (configService.get('NODE_ENV') !== 'production') {
        app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
            prefix: '/uploads/',
        });
    }
    app.enableCors({
        origin: configService.get('FRONTEND_URL') || 'http://localhost:5173',
        credentials: true,
    });
    const apiPrefix = configService.get('API_PREFIX') || 'api';
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Wedding Booking Platform API')
        .setDescription('API for Wedding Services Marketplace and Provider SaaS')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('providers', 'Provider management')
        .addTag('categories', 'Service categories')
        .addTag('services', 'Service listings')
        .addTag('bookings', 'Booking management')
        .addTag('payments', 'Payment processing')
        .addTag('reviews', 'Reviews and ratings')
        .addTag('messages', 'Messaging system')
        .addTag('notifications', 'Notifications')
        .addTag('admin', 'Admin operations')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map