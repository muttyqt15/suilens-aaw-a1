import amqplib from 'amqplib';
import type { Connection, Channel } from 'amqplib';
import { NotificationService } from '../services/notification.service';

const EXCHANGE = 'suilens.events';
const QUEUE = 'notification-service.order-events';

export async function startConsumer() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const connection: Connection = await amqplib.connect(url);
  const channel: Channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, 'order.*');

  console.log(`Notification service listening on queue: ${QUEUE}`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      console.log(`Received event: ${msg.fields.routingKey}`, data);

      if (msg.fields.routingKey === 'order.placed') {
        await NotificationService.createNotification({
          orderId: data.orderId,
          type: 'order_placed',
          recipient: data.customerEmail,
          message: `Hi ${data.customerName}, your rental order for ${data.lensModelName} has been placed. Order ID: ${data.orderId}`,
        });
        console.log(`Notification created for order ${data.orderId}`);
      }

      if (msg.fields.routingKey === 'order.cancelled') {
        await NotificationService.createNotification({
          orderId: data.orderId,
          type: 'order_cancelled',
          recipient: data.customerEmail || 'system',
          message: `Hi ${data.customerName || 'Customer'}, your order ${data.orderId} has been cancelled. Stock released at branch ${data.branchCode}.`,
        });
        console.log(`Cancellation notification created for order ${data.orderId}`);
      }

      channel.ack(msg);
    } catch (error) {
      console.error('Error processing message:', error);
      channel.nack(msg, false, true);
    }
  });
}
