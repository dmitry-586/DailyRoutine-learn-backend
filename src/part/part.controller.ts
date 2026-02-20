import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
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
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Создать часть (только админ)' })
  @ApiCreatedResponse({ description: 'Часть создана', type: PartResponseDto })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async create(@Body() dto: CreatePartDto): Promise<PartResponseDto> {
    return await this.partService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Редактировать часть (только админ)' })
  @ApiParam({ name: 'id', description: 'ID части' })
  @ApiOkResponse({ description: 'Часть обновлена', type: PartResponseDto })
  @ApiNotFoundResponse({ description: 'Часть не найдена' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePartDto,
  ): Promise<PartResponseDto> {
    return await this.partService.update(id, dto);
  }
}
