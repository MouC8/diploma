// File: qr-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QrModule } from './qr/qr.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(QrModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672'],
      queue: 'diploma_ocr',
      queueOptions: { durable: true },
    },
  });
  await app.listen();
  console.log('qr-service listening for diploma.ocr.completed events');
}
bootstrap();




