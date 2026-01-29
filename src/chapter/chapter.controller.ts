import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateChapterDto } from './chapter-request.dto.js';
import { ChapterResponseDto } from './chapter-response.dto.js';
import { ChapterService } from './chapter.service.js';

@ApiTags('chapter')
@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get()
  @ApiOperation({
    summary: 'Список глав',
    description: 'Опционально по partId',
  })
  @ApiQuery({ name: 'partId', required: false, description: 'ID части' })
  @ApiOkResponse({ description: 'Список глав', type: [ChapterResponseDto] })
  async findAll(
    @Query('partId') partId?: string,
  ): Promise<ChapterResponseDto[]> {
    return this.chapterService.findAll(partId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна глава по ID' })
  @ApiParam({ name: 'id', description: 'ID главы' })
  @ApiOkResponse({ description: 'Глава', type: ChapterResponseDto })
  @ApiNotFoundResponse({ description: 'Глава не найдена' })
  async findOne(@Param('id') id: string): Promise<ChapterResponseDto> {
    return this.chapterService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать главу' })
  @ApiCreatedResponse({
    description: 'Глава создана',
    type: ChapterResponseDto,
  })
  async create(@Body() dto: CreateChapterDto): Promise<ChapterResponseDto> {
    return this.chapterService.create(dto);
  }
}
