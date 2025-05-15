import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageProcessingController } from './image-processing-controller/image-processing-controller.controller';
import { ImageModule } from './image-processing-module/image-processing-module.module';
import { ImageProcessingService } from './image-processing-service/image-processing-service.service';

@Module({
  imports: [ImageModule],
  controllers: [AppController, ImageProcessingController],
  providers: [AppService, ImageProcessingService],
})
export class AppModule {}
