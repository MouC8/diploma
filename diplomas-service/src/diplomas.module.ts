import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DiplomaEntity } from 'src/entities/diploma.entity';
import { DiplomasController } from './diplomas/diplomas.controller';
import { DiplomasService } from './diplomas/diplomas.service';

@Module({
  imports: [
    // Database connection
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'diploma',
      entities: [DiplomaEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([DiplomaEntity]),
    // RabbitMQ client to emit events
    ClientsModule.register([
      {
        name: 'OCR_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@127.0.0.1:5672'],
          queue: 'diploma_uploaded_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [DiplomasController],
  providers: [DiplomasService],
})
export class DiplomasModule {}
