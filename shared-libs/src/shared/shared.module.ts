import { Module, DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createRmqClientOptions } from '../utils/messaging';
import { ClientProviderOptions } from '@nestjs/microservices';

@Module({})
export class SharedModule {
  /**
   * Register one or more RMQ clients dynamically
   * @param clients Array of objects with `name` (token) and `queue`
   */
  static registerClients(
    clients: { name: string; queue: string }[],
  ): DynamicModule {
    const providers: ClientProviderOptions[] = clients.map(c =>
      createRmqClientOptions(c.name, c.queue),
    );
    return {
      module: SharedModule,
      imports: [ClientsModule.register(providers)],
      exports: [ClientsModule],
    };
  }
}