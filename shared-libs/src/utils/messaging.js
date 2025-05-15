"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRmqClientOptions = createRmqClientOptions;
exports.publishEvent = publishEvent;
const microservices_1 = require("@nestjs/microservices");
function createRmqClientOptions(name, queue, urls = [process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672']) {
    return {
        name,
        transport: microservices_1.Transport.RMQ,
        options: {
            urls,
            queue,
            queueOptions: { durable: true },
        },
    };
}
async function publishEvent(client, pattern, payload) {
    await client.connect();
    await client.emit(pattern, payload).toPromise();
}
//# sourceMappingURL=messaging.js.map