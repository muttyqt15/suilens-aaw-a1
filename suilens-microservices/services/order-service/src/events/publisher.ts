import amqplib from 'amqplib';
import type { Channel, ConfirmChannel, Connection } from 'amqplib';

const EXCHANGE = 'suilens.events';
let connection: Connection | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  console.log('Connected to RabbitMQ');
}

export async function publishOrderPlaced(data: Record<string, unknown>) {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  const message = Buffer.from(JSON.stringify(data));
  channel.publish(EXCHANGE, 'order.placed', message, { persistent: true });
  console.log('Published order.placed event');
}

export async function publishOrderCancelled(data: {
  orderId: string;
  lensId: string;
  branchCode: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
}) {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  const message = Buffer.from(JSON.stringify(data));
  channel.publish(EXCHANGE, 'order.cancelled', message, { persistent: true });
  console.log('Published order.cancelled event');
}
