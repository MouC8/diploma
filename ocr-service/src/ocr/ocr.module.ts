import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OCR_SERVICE, PROCESSED_QUEUE } from '../constants';

@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'OCR_SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672'],
    //       queue: 'diploma_uploaded_queue',
    //       queueOptions: { durable: true },
    //     },
    //   },
    // ]),

    ClientsModule.register([
      {
        name: OCR_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@127.0.0.1:5672'],
          queue: PROCESSED_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [OcrController],
  providers: [OcrService],
})
export class OcrModule {}
