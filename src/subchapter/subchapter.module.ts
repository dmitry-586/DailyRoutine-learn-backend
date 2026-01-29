import { Module } from '@nestjs/common';
import { SubchapterController } from './subchapter.controller.js';
import { SubchapterService } from './subchapter.service.js';

@Module({
  controllers: [SubchapterController],
  providers: [SubchapterService],
})
export class SubchapterModule {}
