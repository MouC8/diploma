import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { OcrService } from './ocr.service';
import { DiplomaUploadedPayload, OcrResultDto } from '../../../shared-libs/src/dto/index';

@Controller()
export class OcrController {
  private readonly logger = new Logger(OcrController.name);
  constructor(private readonly ocrService: OcrService) {}

  @EventPattern('diploma.uploaded.processed')
  async handleProcessed(
    @Payload() record: { id: string; path: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();
    this.logger.log(`Received diploma.uploaded.processed for id=${record.id}`);
    await this.ocrService.handleImage(record);
    channel.ack(msg);
    this.logger.log(`Acknowledged and processed OCR for id=${record.id}`);
  }

    @EventPattern('legacy.uploaded')
  async handleLegacyUpload(
    @Payload() payload: DiplomaUploadedPayload,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`legacy.uploaded for OCR: ${payload.id}`);
    // Convert & call service
    const ocrData: OcrResultDto = await this.ocrService.extractText(payload.path);
    ocrData.id = payload.id;
    await this.ocrService.emitOcrResult(ocrData);
    ctx.getChannelRef().ack(ctx.getMessage());
  }
}
