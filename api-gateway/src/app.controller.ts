// api-gateway/src/app.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DiplomaUploadedPayload } from '@shared-libs/dto';

@Controller('diplomas')
export class AppController {
  constructor(
    @Inject('DIPLOMA_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  health() {
    return { status: 'API Gateway is running' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
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
      await this.client.emit('diploma.uploaded', payload).toPromise();
      return { status: 'success', id: payload.id };
    } catch (err) {
      throw new HttpException(
        'Failed to emit upload event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
