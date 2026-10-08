import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drift } from './entities/drift.entity';
import { StorageService } from '../storage/storage.service';
import { GemmaVisionService } from '../vision/gemma-vision.service';

@Injectable()
export class DriftService {
  constructor(
    @InjectRepository(Drift)
    private readonly driftRepo: Repository<Drift>,
    private readonly storageService: StorageService,
    private readonly visionService: GemmaVisionService,
  ) {}

  async analyzeAndSave(file: Express.Multer.File): Promise<Drift> {
    const { relativeUrl } = await this.storageService.saveFile(file);
    const analysis = await this.visionService.analyzeCloud(
      file.buffer,
      file.mimetype,
    );

    const drift = this.driftRepo.create({
      imageUrl: relativeUrl,
      ...analysis,
    });

    return this.driftRepo.save(drift);
  }

  async findAll(): Promise<Drift[]> {
    return this.driftRepo.find({ order: { createdAt: 'DESC' } });
  }
}
