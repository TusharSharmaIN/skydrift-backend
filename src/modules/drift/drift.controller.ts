import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriftService } from './drift.service';

@Controller('drift')
export class DriftController {
  constructor(private readonly driftService: DriftService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image'))
  async analyze(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(jpeg|jpg|png|webp)/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.driftService.analyzeAndSave(file);
  }

  @Get('gallery')
  async getGallery() {
    return this.driftService.findAll();
  }
}
