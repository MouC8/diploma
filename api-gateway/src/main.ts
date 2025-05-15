import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { AllExceptionsFilter } from './common/filters/all-exceptions/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Validation globale
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  // 2. Gestion centralisée des erreurs
  app.useGlobalFilters(new AllExceptionsFilter());
  // 3. Logging global
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 4. Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Gateway vers les microservices diplômes')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('diplomas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  await app.listen(4000);
  console.log('API Gateway HTTP listening on http://localhost:4000');

  // 5. Microservice RMQ
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'diploma_commands',
      queueOptions: { durable: true },
    },
  });


  await app.startAllMicroservices();
  console.log('Connected to RabbitMQ');
}
bootstrap();

