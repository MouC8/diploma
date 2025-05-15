import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { QrService } from './qr.service';
import { OcrResultDto, QrGeneratedPayload } from '../../../shared-libs/src/dto/index';

@Controller()
export class QrController {
  private readonly logger = new Logger(QrController.name);

  constructor(private readonly qrService: QrService) {}

  @EventPattern('diploma.ocr.completed')
  async handleOcrCompleted(
    @Payload() data: { id: string; nom: string; prenom: string; numeroImmatriculation: string; dateObtention: string; rawText: string},
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();
    this.logger.log(`Received diploma.ocr.completed: ${data.id}`);
    await this.qrService.generateAndEmit(data);
    channel.ack(msg);
  }

  @EventPattern('legacy.qr.generate')
  async handleLegacyQrGenerate(
    @Payload() data: { id: string },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Generating QR for legacy diploma ${data.id}`);
    await this.qrService.generateAndEmit({ id: data.id } as any /* map to OcrData shape */);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  @EventPattern('legacy.ocr.completed')
  async handleLegacyOcr(
    @Payload() dto: OcrResultDto,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`legacy.ocr.completed for QR: ${dto.id}`);
    // Generate & emit QR
    const qrPayload = await this.qrService.generateQrForLegacy(dto.id);
    await this.qrService.emitQrGenerated(qrPayload);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  // Optionnellement écouter 'legacy.qr.generate' instead of ocr.completed
  @EventPattern('legacy.qr.generate')
  async handleLegacyQrGenerate(
    @Payload() { id }: { id: string },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`legacy.qr.generate for ${id}`);
    const qrPayload = await this.qrService.generateQrForLegacy(id);
    await this.qrService.emitQrGenerated(qrPayload);
    ctx.getChannelRef().ack(ctx.getMessage());
  }
}