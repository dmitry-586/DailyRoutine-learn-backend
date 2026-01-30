import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCardCategoryDto,
  UpdateCardCategoryDto,
} from './category-request.dto.js';
import { CardCategoryResponseDto } from './category-response.dto.js';
import { CardCategoryService } from './category.service.js';

@ApiTags('category')
@Controller('category')
export class CardCategoryController {
  constructor(private readonly cardCategoryService: CardCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Список категорий карточек' })
  @ApiOkResponse({
    description: 'Список категорий',
    type: [CardCategoryResponseDto],
  })
  async findAll(): Promise<CardCategoryResponseDto[]> {
    return await this.cardCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна категория по ID' })
  @ApiParam({ name: 'id', description: 'ID категории' })
  @ApiOkResponse({
    description: 'Категория',
    type: CardCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  async findOne(@Param('id') id: string): Promise<CardCategoryResponseDto> {
    return await this.cardCategoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать категорию карточек' })
  @ApiCreatedResponse({
    description: 'Категория создана',
    type: CardCategoryResponseDto,
  })
  async create(
    @Body() dto: CreateCardCategoryDto,
  ): Promise<CardCategoryResponseDto> {
    return await this.cardCategoryService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать категорию карточек' })
  @ApiParam({ name: 'id', description: 'ID категории' })
  @ApiOkResponse({
    description: 'Категория обновлена',
    type: CardCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCardCategoryDto,
  ): Promise<CardCategoryResponseDto> {
    return await this.cardCategoryService.update(id, dto);
  }
}
