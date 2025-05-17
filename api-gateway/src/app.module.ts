import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayController } from './gateway/gateway.controller';
import { GatewayService } from './gateway/gateway.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './custom-throttler/custom-throttler.guard'; // Ajustez le chemin selon l'emplacement
import { LegacyController } from './legacy/legacy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuration du throttling : 100 requêtes par 60 secondes
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
      ignoreUserAgents: [],
    } as any), // En cas de problème de typage, vous pouvez utiliser as any
    ClientsModule.register([
      {
        name: 'DIPLOMA_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@127.0.0.1:5672'],
          queue: 'diploma_uploaded_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [GatewayController, LegacyController],
  providers: [
    GatewayService,
    { provide: APP_GUARD, useClass: CustomThrottlerGuard }, // Utilisation du guard personnalisé pour le throttling
  ],
})
export class AppModule {}
