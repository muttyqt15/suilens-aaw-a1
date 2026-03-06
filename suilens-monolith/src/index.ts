// src/index.ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { catalogRoutes } from './routes/catalog.routes';
import { orderRoutes } from './routes/order.routes';

const app = new Elysia()
  .use(cors())
  .use(catalogRoutes)
  .use(orderRoutes)
  .get('/health', () => ({ status: 'ok', service: 'suilens-monolith' }))
  .listen(3000);

console.log(`SuiLens monolith running at http://localhost:${app.server?.port}`);
