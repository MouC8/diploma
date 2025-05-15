import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'OCR_EVENTS',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5872'],
          queue: 'diploma_ocr',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [OcrController],
  providers: [OcrService],
})
export class OcrModule {}
