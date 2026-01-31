import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChapterController } from './chapter.controller.js';
import { ChapterService } from './chapter.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
