import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrController } from './qr/qr.controller';
import { QrService } from './qr/qr.service';
import { QrModule } from './qr/qr.module';

@Module({
  imports: [QrModule],
  controllers: [AppController, QrController],
  providers: [AppService, QrService],
})
export class AppModule {}
