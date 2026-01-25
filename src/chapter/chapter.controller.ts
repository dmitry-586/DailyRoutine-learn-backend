import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ChapterNavigationDto,
  ChapterResponseDto,
} from './chapter-response.dto.js';
import { ChapterService } from './chapter.service.js';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get()
  async findAll(
    @Query('partId') partId?: string,
  ): Promise<ChapterResponseDto[]> {
    return this.chapterService.findAll(partId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChapterResponseDto> {
    return this.chapterService.findOne(id);
  }

  @Get(':id/next')
  async findNext(
    @Param('id') id: string,
  ): Promise<ChapterNavigationDto | null> {
    return this.chapterService.findNext(id);
  }

  @Get(':id/previous')
  async findPrevious(
    @Param('id') id: string,
  ): Promise<ChapterNavigationDto | null> {
    return this.chapterService.findPrevious(id);
  }
}
