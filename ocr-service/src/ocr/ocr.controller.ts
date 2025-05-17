import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { OcrService } from './ocr.service';
import { DiplomaUploadedPayload, OcrResultDto } from '@shared-libs/dto/dist/dto';
import { PROCESSED_PATTERN } from '../constants';

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

  @EventPattern('diploma.uploaded')
  async onDiplomaUploaded(
    @Payload() payload: DiplomaUploadedPayload,
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`Processing OCR for id=${payload.id}`);
    await this.ocrService.extractText(payload.path);
    ctx.getChannelRef().ack(ctx.getMessage());
  }

  @EventPattern(PROCESSED_PATTERN)
  async onProcessed(
    @Payload() data: { id: string; resultPath: string },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(`OCR on ${data.id}`);
    await this.ocrService.extractTextAndSave(data);
    ctx.getChannelRef().ack(ctx.getMessage());
  }
}
