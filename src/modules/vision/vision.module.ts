import { Module } from '@nestjs/common';
import { GemmaVisionService } from './gemma-vision.service';

@Module({
  providers: [GemmaVisionService],
  exports: [GemmaVisionService],
})
export class VisionModule {}
