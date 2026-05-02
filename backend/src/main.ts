import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:5173',
    credentials: true,
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger API documentation
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Start server
  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
