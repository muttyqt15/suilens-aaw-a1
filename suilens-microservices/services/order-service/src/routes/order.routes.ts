import { Elysia, t } from 'elysia';
import { OrderService } from '../services/order.service';

export const orderRoutes = new Elysia({ prefix: '/api/orders' })
  .post('/', async ({ body }) => {
    try {
      const order = await OrderService.createOrder(body);
      return new Response(JSON.stringify(order), { status: 201 });
    } catch (error: any) {
      if (error.message.includes('Insufficient stock') || error.message.includes('INSUFFICIENT_STOCK')) {
        return new Response(JSON.stringify({ error: error.message }), { status: 409 });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }, {
    body: t.Object({
      customerName: t.String(),
      customerEmail: t.String({ format: 'email' }),
      lensId: t.String({ format: 'uuid' }),
      branchCode: t.String(),
      startDate: t.String(),
      endDate: t.String(),
      quantity: t.Optional(t.Number()),
    }),
  })
  .patch('/:id/cancel', async ({ params }) => {
    try {
      const order = await OrderService.cancelOrder(params.id);
      return order;
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
      }
      if (error.message === 'ORDER_ALREADY_CANCELLED') {
        return new Response(JSON.stringify({ error: 'Order is already cancelled' }), { status: 400 });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
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
