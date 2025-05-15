import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { DiplomasService } from './diplomas.service';

@Controller()
export class DiplomasController {
  private readonly logger = new Logger(DiplomasController.name);
  constructor(private readonly diplomasService: DiplomasService) {}

  @EventPattern('diploma.uploaded')
  async onUploaded(
    @Payload() data: { filename: string; path: string },
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`Received diploma.uploaded: ${JSON.stringify(data)}`);
    await this.diplomasService.processUpload(data);
    channel.ack(originalMsg);
    this.logger.log('Acknowledged diploma.uploaded');
  }

  @EventPattern('diploma.create')
  async onCreate(
    @Payload() dto: any,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();
    this.logger.log(`Received diploma.create: ${JSON.stringify(dto)}`);
    const created = await this.diplomasService.createDiploma(dto);
    channel.ack(msg);
    this.logger.log(`Diploma record created: ${JSON.stringify(created)}`);
  }
}