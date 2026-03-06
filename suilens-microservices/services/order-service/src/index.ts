import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { orderRoutes } from './routes/order.routes';
import { connectRabbitMQ } from './events/publisher';

await connectRabbitMQ();

const app = new Elysia()
  .use(cors())
  .use(orderRoutes)
  .get('/health', () => ({ status: 'ok', service: 'order-service' }))
  .listen(3002);

console.log(`Order service running at http://localhost:${app.server?.port}`);
