import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.setGlobalPrefix('api');
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Daily Routine Learn API')
    .setDescription(
      'API для курса обучения. Авторизация через HttpOnly cookies (accessToken, refreshToken).\n\n' +
        '**Импорт в Postman:** File → Import → Link → вставьте URL спецификации OpenAPI:\n' +
        '`http://localhost:4000/api/docs-json` (или ваш BASE_URL + `/api/docs-json`)',
    )
    .setVersion('1.0')
    .addTag('auth', 'Авторизация')
    .addTag('part', 'Части курса')
    .addTag('chapter', 'Главы')
    .addTag('subchapter', 'Подразделы глав')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documentFactory, {
    useGlobalPrefix: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
