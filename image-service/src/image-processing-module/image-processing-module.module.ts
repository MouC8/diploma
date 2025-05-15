// File: image-service/src/image.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ImageProcessingController } from '../image-processing-controller/image-processing-controller.controller';
import { ImageProcessingService } from '../image-processing-service/image-processing-service.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IMAGE_EVENTS',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672'],
          queue: 'diploma_image',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ImageProcessingController],
  providers: [ImageProcessingService],
})
export class ImageModule {}