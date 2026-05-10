import { Module } from '@nestjs/common';
import { FigmaController } from './figma.controller.js';
import { FigmaService } from './figma.service.js';

@Module({
  controllers: [FigmaController],
  providers: [FigmaService],
})
export class FigmaModule {}
