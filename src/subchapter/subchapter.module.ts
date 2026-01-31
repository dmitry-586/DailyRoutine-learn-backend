import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SubchapterController } from './subchapter.controller.js';
import { SubchapterService } from './subchapter.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SubchapterController],
  providers: [SubchapterService],
})
export class SubchapterModule {}
