// File: qr-service/src/qr.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'QR_EVENTS',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672'],
          queue: 'diploma_qr',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}