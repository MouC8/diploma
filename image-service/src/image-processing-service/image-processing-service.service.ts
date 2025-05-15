import { Injectable, Logger, InternalServerErrorException, BadRequestException, Inject } from '@nestjs/common';
import * as sharp from 'sharp';
import { OverlayOptionsDto, QrPosition } from '../dto/overlay-qr.dto';
import { glob } from 'fs';
import { firstValueFrom } from 'rxjs';
import { ImageProcessedPayload } from '../../../shared-libs/src/dto';

interface ImageDimensions { width: number; height: number; }

@Injectable()
export class ImageProcessingService {

  private readonly logger = new Logger(ImageProcessingService.name);
  client: any;

  async overlayQrOnDiploma(
    diplomaImageBuffer: Buffer,
    qrCodeBuffer: Buffer,
    options: OverlayOptionsDto = {},
  ): Promise<Buffer> {
    this.logger.log('Starting QR overlay processing');
    try {
      const diploma = sharp(diplomaImageBuffer);
      const { width: dw, height: dh } = await diploma.metadata();
      if (!dw || !dh) throw new BadRequestException('Invalid diploma image');

      const qr = sharp(qrCodeBuffer).resize(options.qrSize || 150, options.qrSize || 150, { fit: 'contain', kernel: sharp.kernel.lanczos3 });
      const qrMetadata = await qr.metadata();
      if (!qrMetadata.width || !qrMetadata.height) throw new BadRequestException('Invalid QR image');
      const qrBuf = await qr.toBuffer();

      const { top, left } = this.calculateCoordinates({ width: dw, height: dh }, { width: qrMetadata.width, height: qrMetadata.height }, options);
      this.logger.log(`Overlay coordinates: top=${top}, left=${left}`);

      return await diploma.composite([{ input: qrBuf, top, left }]).toBuffer();
    } catch (err) {
      this.logger.error('Error in QR overlay', err.stack);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Image processing failed');
    }
  }

  private calculateCoordinates(
    diploma: ImageDimensions,
    qr: ImageDimensions,
    opts: OverlayOptionsDto,
  ): { top: number; left: number } {
    const margin = opts.margin ?? 10;
    let top: number, left: number;
    if (typeof opts.x === 'number' && typeof opts.y === 'number') {
      left = opts.x; top = opts.y;
    } else {
      switch (opts.position || QrPosition.BOTTOM_RIGHT) {
        case QrPosition.TOP_LEFT: left = margin; top = margin; break;
        case QrPosition.TOP_RIGHT: left = diploma.width - qr.width - margin; top = margin; break;
        case QrPosition.BOTTOM_LEFT: left = margin; top = diploma.height - qr.height - margin; break;
        case QrPosition.CENTER: left = (diploma.width - qr.width)/2; top = (diploma.height - qr.height)/2; break;
        case QrPosition.BOTTOM_RIGHT:
        default: left = diploma.width - qr.width - margin; top = diploma.height - qr.height - margin;
      }
    }
    return { top: Math.max(0, top), left: Math.max(0, left) };
  }

  async loadLegacyImage(id: string): Promise<Buffer> {
    // Exemple si vous stockez sur le disque sous uploads/legacy/:id-*.png
    const files = glob.sync(`./uploads/legacy/${id}-*`);
    if (!files.length) throw new Error(`Legacy image not found for ${id}`);
    return fs.promises.readFile(files[0]);
  }

  /** Émet l’event image finale */
  async emitImageProcessed(data: ImageProcessedPayload) {
    await firstValueFrom(this.client.emit('legacy.image.processed', data));
    this.logger.log(`Emitted legacy.image.processed for ${data.id}`);
  }
}

