// import { NestFactory } from '@nestjs/core';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { ImageModule } from './image-processing-module/image-processing-module.module';

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(ImageModule, {
//     transport: Transport.RMQ,
//     options: {
//       urls: [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672'],
//       queue: 'diploma_qr',
//       queueOptions: { durable: true },
//     },
//   });
//   await app.listen();
//   console.log('🔧 image-service listening for diploma.qr.generated events');
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3004);
  console.log(`image-service HTTP listening on port ${process.env.PORT || 3004}`);
}
bootstrap();
