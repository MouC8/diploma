import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ImageProcessingService } from '../image-processing-service/image-processing-service.service';

import { QrGeneratedPayload, ImageProcessedPayload } from '../../../shared-libs/src/dto/index';

@Controller()
export class ImageProcessingController {
  private readonly logger = new Logger(ImageProcessingController.name);
  imageService: any;
  constructor(private readonly svc: ImageProcessingService) {}

  @EventPattern('diploma.qr.generated')
  async handleQrGenerated(
    @Payload() data: { id: string; verifyUrl: string; qrCodeBase64: string },
    @Ctx() ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    this.logger.log(`Received diploma.qr.generated for id=${data.id}`);

    // Convert base64 to buffer
    const qrBuffer = Buffer.from(data.qrCodeBase64, 'base64');
    // Load original diploma image from path or DB (not detailed here)
    const diplomaImageBuffer = await this.loadDiplomaImage(data.id);

    const outputBuffer = await this.svc.overlayQrOnDiploma(diplomaImageBuffer, qrBuffer, {});

    // Emit next event diploma.image.processed with buffer as base64
    const imageBase64 = outputBuffer.toString('base64');
    await this.svc.emitImageProcessed({ id: data.id, imageBase64 });

    channel.ack(msg);
    this.logger.log(`Processed and emitted diploma.image.processed for id=${data.id}`);
  }

  private async loadDiplomaImage(id: string): Promise<Buffer> {
    // TODO: récupérer le chemin depuis DB et lire le fichier
    throw new Error('Not implemented');
  }

  @EventPattern('legacy.overlay')
  async handleLegacyOverlay(
    @Payload() data: { id: string },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Overlay QR on legacy ${data.id}`);
    // Récupérer le QR et le path du diplôme depuis DB via service
    const { imageBase64, qrCodeBase64 } = await this.loadLegacyBuffers(data.id);
    const output = await this.svc.overlayQrOnDiploma(
      Buffer.from(imageBase64, 'base64'),
      Buffer.from(qrCodeBase64, 'base64'),
      {},
    );
    await this.svc.emitImageProcessed({ id: data.id, imageBase64: output.toString('base64') });
    ctx.getChannelRef().ack(ctx.getMessage());
  }
  loadLegacyBuffers(id: string): { imageBase64: any; qrCodeBase64: any; } | PromiseLike<{ imageBase64: any; qrCodeBase64: any; }> {
    throw new Error('Method not implemented.');
  }

  @EventPattern('legacy.qr.generated')
  async handleLegacyQrGenerated(
    @Payload() payload: QrGeneratedPayload,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`legacy.qr.generated: ${payload.id}`);
    // Load original diploma image & QR codes
    const diplomaBuf = await this.loadLegacyImage(payload.id);
    const qrBuf = Buffer.from(payload.qrCodeBase64, 'base64');
    // Composite
    const resultBuf = await this.imageService.overlayQrOnDiploma(diplomaBuf, qrBuf, {});
    // Emit final image
    const imgPayload: ImageProcessedPayload = {
      id: payload.id,
      imageBase64: resultBuf.toString('base64'),
    };
    await this.imageService.emitImageProcessed(imgPayload);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  private async loadLegacyImage(id: string): Promise<Buffer> {
    // Récupérer le path en base de données
    // return fs.readFileSync(path);
    throw new Error('Not implemented');
  }
}

// Extend service to emit image processed

// In ImageProcessingService:
// import { ClientProxy } from '@nestjs/microservices';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class ImageProcessingService {
//   // ...existing methods...
//   @Inject('IMAGE_EVENTS') private readonly client: ClientProxy;

//   async emitImageProcessed(data: { id: string; imageBase64: string }) {
//     await firstValueFrom(this.client.emit('diploma.image.processed', data));
//     this.logger.log(`Emitted diploma.image.processed for id=${data.id}`);
//   }
// }
