import { Module } from '@nestjs/common';
import { ChapterModule } from './chapter/chapter.module.js';

@Module({
  imports: [ChapterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
