import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiplomasModule } from './diplomas.module';

@Module({
  imports: [DiplomasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
