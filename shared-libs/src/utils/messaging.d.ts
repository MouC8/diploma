import { ClientProxy, ClientProviderOptions } from '@nestjs/microservices';
export declare function createRmqClientOptions(name: string, queue: string, urls?: string[]): ClientProviderOptions;
export declare function publishEvent<T>(client: ClientProxy, pattern: string, payload: T): Promise<void>;
