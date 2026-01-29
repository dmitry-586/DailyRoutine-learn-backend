import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Daily Routine Learn API')
    .setDescription('API для курса обучения')
    .setVersion('1.0')
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
