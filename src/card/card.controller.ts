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
import { CreateCardDto } from './card-request.dto.js';
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
    return this.cardService.findAll(categoryId);
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
    return this.cardService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать карточку' })
  @ApiCreatedResponse({
    description: 'Карточка создана',
    type: CardResponseDto,
  })
  async create(@Body() dto: CreateCardDto): Promise<CardResponseDto> {
    return this.cardService.create(dto);
  }
}
