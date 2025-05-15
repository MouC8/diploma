import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OcrModule } from './ocr/ocr.module';
async function bootstrap() {
  const app = await NestFactory.create(OcrModule);
  app.enableCors();
  await app.listen(5872);
  console.log('templates-service HTTP listening on port 5872');
}
bootstrap();

