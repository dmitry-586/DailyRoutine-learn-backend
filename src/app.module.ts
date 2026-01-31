import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { CardCategoryModule } from './card-category/category.module.js';
import { CardModule } from './card/card.module.js';
import { ChapterModule } from './chapter/chapter.module.js';
import { PartModule } from './part/part.module.js';
import { SubchapterModule } from './subchapter/subchapter.module.js';

@Module({
  imports: [
    AuthModule,
    ChapterModule,
    PartModule,
    SubchapterModule,
    CardCategoryModule,
    CardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
