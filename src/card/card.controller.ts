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
import { CreateCardDto, UpdateCardDto } from './card-request.dto.js';
import { CardResponseDto } from './card-response.dto.js';
import { CardService } from './card.service.js';

@ApiTags('card')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({
    summary: 'Список карточек',
    description: 'Опционально по categoryId',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID категории карточек',
  })
  @ApiOkResponse({
    description: 'Список карточек',
    type: [CardResponseDto],
  })
  async findAll(
    @Query('categoryId') categoryId?: string,
  ): Promise<CardResponseDto[]> {
    return await this.cardService.findAll(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна карточка по ID' })
  @ApiParam({ name: 'id', description: 'ID карточки' })
  @ApiOkResponse({
    description: 'Карточка',
    type: CardResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Карточка не найдена' })
  async findOne(@Param('id') id: string): Promise<CardResponseDto> {
    return await this.cardService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Создать карточку (только админ)' })
  @ApiCreatedResponse({
    description: 'Карточка создана',
    type: CardResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async create(@Body() dto: CreateCardDto): Promise<CardResponseDto> {
    return await this.cardService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Редактировать карточку (только админ)' })
  @ApiParam({ name: 'id', description: 'ID карточки' })
  @ApiOkResponse({
    description: 'Карточка обновлена',
    type: CardResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Карточка не найдена' })
  @ApiForbiddenResponse({ description: 'Доступ только для администратора' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    return await this.cardService.update(id, dto);
  }
}
