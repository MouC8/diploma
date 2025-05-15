import { ClientProxy, ClientProviderOptions, Transport } from '@nestjs/microservices';

/** 
 * Génère un provider RMQ compatible ClientsModule.register()
 */
export function createRmqClientOptions(
  name: string,
  queue: string,
  urls: string[] = [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672'],
): ClientProviderOptions {
  return {
    name,                           // clé d'injection
    transport: Transport.RMQ,
    options: {
      urls,
      queue,
      queueOptions: { durable: true },
    },
  };
}

  
  /**
   * Publish an event to a RabbitMQ client proxy
   */
  export async function publishEvent<T>(
    client: ClientProxy,
    pattern: string,
    payload: T,
  ): Promise<void> {
    await client.connect();
    await client.emit<T>(pattern, payload).toPromise();
    // Note: client.close() can be handled by Nest lifecycle
  }