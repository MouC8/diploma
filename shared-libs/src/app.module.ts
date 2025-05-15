import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    SharedModule.registerClients([
      { name: 'OCR_EVENTS', queue: 'diploma_ocr' },
      { name: 'QR_EVENTS',   queue: 'diploma_qr'   },
      // etc.
    ]),
    // autres modules...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
