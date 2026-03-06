import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { inventoryRoutes } from './routes/inventory.routes';
import { startConsumer } from './events/consumer';

await startConsumer();

const app = new Elysia()
  .use(cors())
  .use(inventoryRoutes)
  .get('/health', () => ({ status: 'ok', service: 'inventory-service' }))
  .listen(3004);

console.log(`Inventory service running at http://localhost:${app.server?.port}`);
