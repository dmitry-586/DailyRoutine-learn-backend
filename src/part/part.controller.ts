import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePartDto, UpdatePartDto } from './part-request.dto.js';
import { PartResponseDto } from './part-response.dto.js';
import { PartService } from './part.service.js';

@ApiTags('part')
@Controller('part')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Get()
  @ApiOperation({ summary: 'Список частей курса' })
  @ApiOkResponse({ description: 'Список частей', type: [PartResponseDto] })
  async findAll(): Promise<PartResponseDto[]> {
    return await this.partService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна часть по ID' })
  @ApiParam({ name: 'id', description: 'ID части' })
  @ApiOkResponse({ description: 'Часть', type: PartResponseDto })
  @ApiNotFoundResponse({ description: 'Часть не найдена' })
  async findOne(@Param('id') id: string): Promise<PartResponseDto> {
    return await this.partService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать часть' })
  @ApiCreatedResponse({ description: 'Часть создана', type: PartResponseDto })
  async create(@Body() dto: CreatePartDto): Promise<PartResponseDto> {
    return await this.partService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать часть' })
  @ApiParam({ name: 'id', description: 'ID части' })
  @ApiOkResponse({ description: 'Часть обновлена', type: PartResponseDto })
  @ApiNotFoundResponse({ description: 'Часть не найдена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePartDto,
  ): Promise<PartResponseDto> {
    return await this.partService.update(id, dto);
  }
}
