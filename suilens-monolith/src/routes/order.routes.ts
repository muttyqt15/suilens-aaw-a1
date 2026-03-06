// src/routes/order.routes.ts
import { Elysia, t } from 'elysia';
import { OrderService } from '../services/order.service';

export const orderRoutes = new Elysia({ prefix: '/api/orders' })
  .post('/', async ({ body }) => {
    try {
      const order = await OrderService.createOrder(body);
      return new Response(JSON.stringify(order), { status: 201 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }, {
    body: t.Object({
      customerName: t.String(),
      customerEmail: t.String({ format: 'email' }),
      lensId: t.String({ format: 'uuid' }),
      startDate: t.String(),
      endDate: t.String(),
    }),
  })
  .get('/', async () => {
    return OrderService.getAllOrders();
  })
  .get('/:id', async ({ params }) => {
    const order = await OrderService.getOrderById(params.id);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }
    return order;
  });
