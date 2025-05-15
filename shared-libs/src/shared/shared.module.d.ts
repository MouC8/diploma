import { DynamicModule } from '@nestjs/common';
export declare class SharedModule {
    static registerClients(clients: {
        name: string;
        queue: string;
    }[]): DynamicModule;
}
