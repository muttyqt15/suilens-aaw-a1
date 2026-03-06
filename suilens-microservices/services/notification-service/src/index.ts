import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { startConsumer } from './events/consumer';

await startConsumer();

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok', service: 'notification-service' }))
  .listen(3003);

console.log(`Notification service running at http://localhost:${app.server?.port}`);
