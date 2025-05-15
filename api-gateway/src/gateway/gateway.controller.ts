import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException, Get, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GatewayService } from './gateway.service';
import { CreateDiplomaDto } from '../dto/create-diploma.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller('api/legacy')
export class GatewayController  {
  constructor(
    @Inject('DIPLOMA_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Upload legacy diploma
   */
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
    const record = { id: uuidv4(), filename: file.filename, path: file.path, legacy: true };
    // Persist via microservice
    await this.client.emit('legacy.uploaded', record);
    return { id: record.id };
  }

  /**
   * Get legacy diploma details
   */
  @Get(':id')
  getLegacy(@Param('id') id: string) {
    // Could delegate to DiplomasService via REST or RMQ RPC
    // For simplicity, call REST on diplomas-service
    return /* call service to fetch record by id */;
  }

  /**
   * Submit OCR corrections
   */
  @Patch(':id/verify')
  async verifyLegacy(@Param('id') id: string, @Body() dto: { nom: string; prenom: string; numeroImmatriculation: string; dateObtention: string }) {
    await this.client.emit('legacy.ocr.completed', { id, ...dto });
    return { status: 'validation_sent' };
  }

  /**
   * Generate QR for legacy diploma
   */
  @Post(':id/qr')
  async generateLegacyQr(@Param('id') id: string) {
    await this.client.emit('legacy.qr.requested', { id });
    return { status: 'qr_requested' };
  }

  /**
   * Overlay QR on legacy diploma image
   */
  @Post(':id/overlay')
  async overlayLegacy(@Param('id') id: string) {
    await this.client.emit('legacy.overlay.requested', { id });
    return { status: 'overlay_requested' };
  }
}