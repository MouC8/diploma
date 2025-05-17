import { Controller, Logger,   Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus} from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { DiplomasService } from './diplomas.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DiplomaUploadedPayload } from '@shared-libs/dto/dist/dto';
import type { File as MulterFile } from 'multer';

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDiploma(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const payload: DiplomaUploadedPayload = {
      id: Date.now().toString(),
      filename: file.originalname,
      path: file.path,
      legacy: false,
    };

    try {
      const saved = await this.diplomasService.processUpload(payload);
      return { status: 'success', id: saved.id, url: saved.urlVerification };
    } catch (error) {
      throw new HttpException(
        error.message || 'Upload processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}