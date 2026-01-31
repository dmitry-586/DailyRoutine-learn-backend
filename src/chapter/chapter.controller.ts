import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateChapterDto, UpdateChapterDto } from './chapter-request.dto.js';
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
    return await this.chapterService.findAll(partId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна глава по ID' })
  @ApiParam({ name: 'id', description: 'ID главы' })
  @ApiOkResponse({ description: 'Глава', type: ChapterResponseDto })
  @ApiNotFoundResponse({ description: 'Глава не найдена' })
  async findOne(@Param('id') id: string): Promise<ChapterResponseDto> {
    return await this.chapterService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Создать главу (только админ)' })
  @ApiCreatedResponse({
    description: 'Глава создана',
    type: ChapterResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async create(@Body() dto: CreateChapterDto): Promise<ChapterResponseDto> {
    return await this.chapterService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Редактировать главу (только админ)' })
  @ApiParam({ name: 'id', description: 'ID главы' })
  @ApiOkResponse({ description: 'Глава обновлена', type: ChapterResponseDto })
  @ApiNotFoundResponse({ description: 'Глава не найдена' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
  ): Promise<ChapterResponseDto> {
    return await this.chapterService.update(id, dto);
  }
}
