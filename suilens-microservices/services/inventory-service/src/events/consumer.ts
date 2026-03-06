import amqplib from 'amqplib';
import type { Connection, Channel } from 'amqplib';
import { InventoryService } from '../services/inventory.service';

const EXCHANGE = 'suilens.events';
const QUEUE = 'inventory-service.order-events';

export async function startConsumer() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const connection: Connection = await amqplib.connect(url);
  const channel: Channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  await channel.assertQueue('inventory-service.dlq', { durable: true });
  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': 'inventory-service.dlq',
    },
  });
  await channel.bindQueue(QUEUE, EXCHANGE, 'order.cancelled');

  console.log(`Inventory service listening on queue: ${QUEUE}`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      console.log(`Received event: ${msg.fields.routingKey}`, data);

      if (msg.fields.routingKey === 'order.cancelled') {
        await InventoryService.releaseStock(
          data.orderId,
          data.lensId,
          data.branchCode,
          data.quantity,
        );
      }

      channel.ack(msg);
    } catch (error) {
      console.error('Error processing message:', error);
      const headers = msg.properties.headers || {};
      const retryCount = (headers['x-retry-count'] as number) || 0;

      if (retryCount >= 3) {
        console.error(`Message failed after ${retryCount} retries, sending to DLQ`);
        channel.nack(msg, false, false);
      } else {
        channel.nack(msg, false, true);
      }
    }
  });
}
