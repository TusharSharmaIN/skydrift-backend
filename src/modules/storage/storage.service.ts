import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly maxFiles = 30; // Limit local storage footprint

  constructor(private readonly config: ConfigService) {
    this.uploadDir = path.resolve(
      process.cwd(),
      this.config.get<string>('UPLOAD_DIR', './uploads'),
    );
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ filename: string; relativeUrl: string }> {
    await this.pruneOldFiles();

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const targetPath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(targetPath, file.buffer);
    return {
      filename,
      relativeUrl: `/uploads/${filename}`,
    };
  }

  private async pruneOldFiles(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.uploadDir);
      const filePaths = files
        .filter((f) => !f.startsWith('.'))
        .map((f) => ({
          name: f,
          fullPath: path.join(this.uploadDir, f),
          time: fs.statSync(path.join(this.uploadDir, f)).mtimeMs,
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the newest files
      if (filePaths.length >= this.maxFiles) {
        const toDelete = filePaths.slice(this.maxFiles - 1);
        for (const item of toDelete) {
          await fs.promises.unlink(item.fullPath);
          this.logger.log(`Pruned old image to save disk space: ${item.name}`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to prune files: ${err.message}`);
    }
  }
}
