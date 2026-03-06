import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { catalogRoutes } from './routes/catalog.routes';

const app = new Elysia()
  .use(cors())
  .use(catalogRoutes)
  .get('/health', () => ({ status: 'ok', service: 'catalog-service' }))
  .listen(3001);

console.log(`Catalog service running at http://localhost:${app.server?.port}`);
