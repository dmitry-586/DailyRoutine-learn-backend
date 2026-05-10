import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { getRequestOrigin } from '../lib/request-origin.js';
import {
  figmaMediaUploadOptions,
  type UploadedFigmaFile,
} from './figma-media.js';
import {
  CreateFigmaChapterDto,
  CreateFigmaSectionDto,
  UpdateFigmaChapterDto,
  UpdateFigmaSectionDto,
} from './figma-request.dto.js';
import {
  FigmaChapterResponseDto,
  FigmaMediaResponseDto,
  FigmaSectionResponseDto,
} from './figma-response.dto.js';
import { FigmaService } from './figma.service.js';

@ApiTags('figma')
@Controller('figma')
export class FigmaController {
  constructor(private readonly figmaService: FigmaService) {}

  @Get('chapters')
  @ApiOperation({ summary: 'Список глав Figma-методички' })
  @ApiOkResponse({
    description: 'Список глав',
    type: [FigmaChapterResponseDto],
  })
  async findAllChapters(): Promise<FigmaChapterResponseDto[]> {
    return await this.figmaService.findAllChapters();
  }

  @Get('chapters/:id')
  @ApiOperation({ summary: 'Одна глава Figma-методички' })
  @ApiParam({ name: 'id', description: 'ID главы' })
  @ApiOkResponse({ description: 'Глава', type: FigmaChapterResponseDto })
  @ApiNotFoundResponse({ description: 'Глава не найдена' })
  async findChapter(@Param('id') id: string): Promise<FigmaChapterResponseDto> {
    return await this.figmaService.findChapter(id);
  }

  @Post('chapters')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Создать главу Figma (только админ)' })
  @ApiCreatedResponse({
    description: 'Глава создана',
    type: FigmaChapterResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async createChapter(
    @Body() dto: CreateFigmaChapterDto,
  ): Promise<FigmaChapterResponseDto> {
    return await this.figmaService.createChapter(dto);
  }

  @Patch('chapters/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Редактировать главу Figma (только админ)' })
  @ApiParam({ name: 'id', description: 'ID главы' })
  @ApiOkResponse({
    description: 'Глава обновлена',
    type: FigmaChapterResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Глава не найдена' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async updateChapter(
    @Param('id') id: string,
    @Body() dto: UpdateFigmaChapterDto,
  ): Promise<FigmaChapterResponseDto> {
    return await this.figmaService.updateChapter(id, dto);
  }

  @Delete('chapters/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'Удалить главу Figma (только админ)',
    description: 'Удаляет главу и все связанные разделы',
  })
  @ApiParam({ name: 'id', description: 'ID главы' })
  @ApiNoContentResponse({ description: 'Глава удалена' })
  @ApiNotFoundResponse({ description: 'Глава не найдена' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async deleteChapter(@Param('id') id: string): Promise<void> {
    return await this.figmaService.deleteChapter(id);
  }

  @Post('sections')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Создать раздел Figma (только админ)' })
  @ApiCreatedResponse({
    description: 'Раздел создан',
    type: FigmaSectionResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async createSection(
    @Body() dto: CreateFigmaSectionDto,
  ): Promise<FigmaSectionResponseDto> {
    return await this.figmaService.createSection(dto);
  }

  @Patch('sections/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Редактировать раздел Figma (только админ)' })
  @ApiParam({ name: 'id', description: 'ID раздела' })
  @ApiOkResponse({
    description: 'Раздел обновлен',
    type: FigmaSectionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Раздел не найден' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async updateSection(
    @Param('id') id: string,
    @Body() dto: UpdateFigmaSectionDto,
  ): Promise<FigmaSectionResponseDto> {
    return await this.figmaService.updateSection(id, dto);
  }

  @Delete('sections/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Удалить раздел Figma (только админ)' })
  @ApiParam({ name: 'id', description: 'ID раздела' })
  @ApiNoContentResponse({ description: 'Раздел удален' })
  @ApiNotFoundResponse({ description: 'Раздел не найден' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async deleteSection(@Param('id') id: string): Promise<void> {
    return await this.figmaService.deleteSection(id);
  }

  @Post('media')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file', figmaMediaUploadOptions))
  @ApiOperation({ summary: 'Загрузить фото или GIF для Figma (только админ)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Файл загружен',
    type: FigmaMediaResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async uploadMedia(
    @UploadedFile() rawFile: UploadedFigmaFile | undefined,
    @Req() request: Request,
  ): Promise<FigmaMediaResponseDto> {
    return await this.figmaService.uploadMedia(
      rawFile,
      getRequestOrigin(request),
    );
  }
}
