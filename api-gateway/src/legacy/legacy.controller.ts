import { Controller, Post, Get, Patch, Param, UploadedFile, UseInterceptors, BadRequestException, Body, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DiplomaEntity } from '../entities/diploma.entity';
import { DiplomaUploadedPayload, OcrResultDto } from '@shared-libs/dto';

@Controller('api/legacy')
export class LegacyController {
  constructor(
    @Inject('DIPLOMA_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('diplomaFile', {
    storage: diskStorage({
      destination: './uploads/legacy',
      filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
    }),
    fileFilter: (req, file, cb) => {
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.mimetype)) {
        return cb(new BadRequestException('Type de fichier non supporté.'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadLegacy(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fichier manquant.');
    const record: DiplomaUploadedPayload = {
      id: uuidv4(),
      filename: file.filename,
      path: file.path,
      legacy: true,
    };
    await firstValueFrom(this.client.emit<DiplomaUploadedPayload>('legacy.uploaded', record));
    return { id: record.id };
  }

  @Get(':id')
  async getLegacy(@Param('id') id: string): Promise<DiplomaEntity> {
    const legacy = await firstValueFrom(
      this.client.send<DiplomaEntity, string>('legacy.get', id)
    );
    if (!legacy) throw new NotFoundException(`Legacy diploma ${id} non trouvé`);
    return legacy;
  }

  @Patch(':id/verify')
  async verifyLegacy(
    @Param('id') id: string,
    @Body() dto: OcrResultDto,
  ) {
    dto.id = id;
    await firstValueFrom(this.client.emit<OcrResultDto>('legacy.ocr.completed', dto));
    return { status: 'validation_sent' };
  }

  @Post(':id/qr')
  async generateLegacyQr(@Param('id') id: string) {
    await firstValueFrom(this.client.emit<{ id: string }>('legacy.qr.requested', { id }));
    return { status: 'qr_requested' };
  }

  @Post(':id/overlay')
  async overlayLegacy(@Param('id') id: string) {
    await firstValueFrom(this.client.emit<{ id: string }>('legacy.overlay.requested', { id }));
    return { status: 'overlay_requested' };
  }
}
