import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');
  mkdirSync(uploadsRoot, { recursive: true });

  app.useStaticAssets(uploadsRoot, { prefix: '/uploads/' });
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
    .addTag('figma', 'Методичка Figma')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documentFactory, {
    useGlobalPrefix: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
