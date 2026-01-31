import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CardCategoryController } from './category.controller.js';
import { CardCategoryService } from './category.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CardCategoryController],
  providers: [CardCategoryService],
})
export class CardCategoryModule {}
