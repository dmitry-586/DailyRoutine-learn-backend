import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller.js';
import { ChapterService } from './chapter.service.js';

@Module({
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
