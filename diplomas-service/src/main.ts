// diplomas-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DiplomasModule } from './diplomas.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DiplomasModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@127.0.0.1:5672'],
        queue: 'diploma_uploaded_queue',
        queueOptions: { durable: true },
      },
    },
  );
  await app.listen();
}
bootstrap();
