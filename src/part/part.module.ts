import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChapterModule } from '../chapter/chapter.module.js';
import { PartController } from './part.controller.js';
import { PartService } from './part.service.js';

@Module({
  imports: [AuthModule, ChapterModule],
  controllers: [PartController],
  providers: [PartService],
})
export class PartModule {}
