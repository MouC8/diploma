// File: templates-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { TemplatesModule } from './templates/templates.module';
async function bootstrap() {
  const app = await NestFactory.create(TemplatesModule);
  app.enableCors();
  await app.listen(3002);
  console.log('templates-service HTTP listening on port 3002');
}
bootstrap();
