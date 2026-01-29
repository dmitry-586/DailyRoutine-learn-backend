import { Module } from '@nestjs/common';
import { CardCategoryController } from './category.controller.js';
import { CardCategoryService } from './category.service.js';

@Module({
  controllers: [CardCategoryController],
  providers: [CardCategoryService],
})
export class CardCategoryModule {}
