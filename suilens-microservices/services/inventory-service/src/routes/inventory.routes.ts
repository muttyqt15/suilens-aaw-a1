import { Elysia, t } from 'elysia';
import { InventoryService } from '../services/inventory.service';

export const inventoryRoutes = new Elysia({ prefix: '/api/inventory' })
  .get('/branches', async () => {
    return InventoryService.getAllBranches();
  })
  .get('/lenses/:lensId', async ({ params }) => {
    return InventoryService.getStockByLens(params.lensId);
  })
  .post('/reserve', async ({ body }) => {
    try {
      const result = await InventoryService.reserveStock(
        body.orderId,
        body.lensId,
        body.branchCode,
        body.quantity,
      );
      return { success: true, ...result };
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_STOCK') {
        return new Response(
          JSON.stringify({ error: `Insufficient stock at branch ${body.branchCode}` }),
          { status: 409 },
        );
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }, {
    body: t.Object({
      orderId: t.String({ format: 'uuid' }),
      lensId: t.String({ format: 'uuid' }),
      branchCode: t.String(),
      quantity: t.Number(),
    }),
  });
