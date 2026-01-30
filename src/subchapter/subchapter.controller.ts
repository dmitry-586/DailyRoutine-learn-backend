import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateSubchapterDto,
  UpdateSubchapterDto,
} from './subchapter-request.dto.js';
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
    return await this.subchapterService.findAll(chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один подраздел по ID' })
  @ApiParam({ name: 'id', description: 'ID подраздела' })
  @ApiOkResponse({ description: 'Подраздел', type: SubchapterResponseDto })
  @ApiNotFoundResponse({ description: 'Подраздел не найден' })
  async findOne(@Param('id') id: string): Promise<SubchapterResponseDto> {
    return await this.subchapterService.findOne(id);
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
    return await this.subchapterService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать подраздел' })
  @ApiParam({ name: 'id', description: 'ID подраздела' })
  @ApiOkResponse({
    description: 'Подраздел обновлён',
    type: SubchapterResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Подраздел не найден' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubchapterDto,
  ): Promise<SubchapterResponseDto> {
    return await this.subchapterService.update(id, dto);
  }
}
