import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DiplomasModule } from './diplomas.module';

async function bootstrap() {
  const rmqUrl = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:3001';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(DiplomasModule, {
    transport: Transport.RMQ,
    options: {
      
urls: [ rmqUrl ],
      queue: 'diploma_commands',
      queueOptions: { durable: true },
    },
  });
  await app.listen();
  console.log('🚀 diplomas-service listening for RabbitMQ messages');
}
bootstrap();