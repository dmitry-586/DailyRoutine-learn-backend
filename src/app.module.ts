import { Module } from '@nestjs/common';
import { ChapterModule } from './chapter/chapter.module.js';
import { PartModule } from './part/part.module.js';
import { SubchapterModule } from './subchapter/subchapter.module.js';

@Module({
  imports: [ChapterModule, PartModule, SubchapterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
