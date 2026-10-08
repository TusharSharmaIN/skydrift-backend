import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drift } from './entities/drift.entity';
import { DriftService } from './drift.service';
import { DriftController } from './drift.controller';
import { StorageModule } from '../storage/storage.module';
import { VisionModule } from '../vision/vision.module';

@Module({
  imports: [TypeOrmModule.forFeature([Drift]), StorageModule, VisionModule],
  controllers: [DriftController],
  providers: [DriftService],
})
export class DriftModule {}
