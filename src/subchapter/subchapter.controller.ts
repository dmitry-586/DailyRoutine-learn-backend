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
import { CreateSubchapterDto } from './subchapter-request.dto.js';
import { SubchapterResponseDto } from './subchapter-response.dto.js';
import { SubchapterService } from './subchapter.service.js';

@ApiTags('subchapter')
@Controller('subchapter')
export class SubchapterController {
  constructor(private readonly subchapterService: SubchapterService) {}

  @Get()
  @ApiOperation({
    summary: 'Список подразделов',
    description: 'Опционально по chapterId',
  })
  @ApiQuery({ name: 'chapterId', required: false, description: 'ID главы' })
  @ApiOkResponse({
    description: 'Список подразделов',
    type: [SubchapterResponseDto],
  })
  async findAll(
    @Query('chapterId') chapterId?: string,
  ): Promise<SubchapterResponseDto[]> {
    return this.subchapterService.findAll(chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один подраздел по ID' })
  @ApiParam({ name: 'id', description: 'ID подраздела' })
  @ApiOkResponse({ description: 'Подраздел', type: SubchapterResponseDto })
  @ApiNotFoundResponse({ description: 'Подраздел не найден' })
  async findOne(@Param('id') id: string): Promise<SubchapterResponseDto> {
    return this.subchapterService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать подраздел' })
  @ApiCreatedResponse({
    description: 'Подраздел создан',
    type: SubchapterResponseDto,
  })
  async create(
    @Body() dto: CreateSubchapterDto,
  ): Promise<SubchapterResponseDto> {
    return this.subchapterService.create(dto);
  }
}
