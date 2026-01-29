import { Module } from '@nestjs/common';
import { CardCategoryController } from './card-category.controller.js';
import { CardCategoryService } from './card-category.service.js';

@Module({
  controllers: [CardCategoryController],
  providers: [CardCategoryService],
})
export class CardCategoryModule {}
