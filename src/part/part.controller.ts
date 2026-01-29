import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePartDto } from './part-request.dto.js';
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
    return this.partService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна часть по ID' })
  @ApiParam({ name: 'id', description: 'ID части' })
  @ApiOkResponse({ description: 'Часть', type: PartResponseDto })
  @ApiNotFoundResponse({ description: 'Часть не найдена' })
  async findOne(@Param('id') id: string): Promise<PartResponseDto> {
    return this.partService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать часть' })
  @ApiCreatedResponse({ description: 'Часть создана', type: PartResponseDto })
  async create(@Body() dto: CreatePartDto): Promise<PartResponseDto> {
    return this.partService.create(dto);
  }
}
