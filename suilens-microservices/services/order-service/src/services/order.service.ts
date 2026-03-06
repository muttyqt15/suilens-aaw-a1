import { db } from '../db';
import { orders } from '../db/schema';
import { eq } from 'drizzle-orm';
import { publishOrderPlaced, publishOrderCancelled } from '../events/publisher';

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3001';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004';

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  lensId: string;
  branchCode: string;
  startDate: string;
  endDate: string;
  quantity?: number;
}

export const OrderService = {
  async createOrder(input: CreateOrderInput) {
    const quantity = input.quantity ?? 1;

    const lensResponse = await fetch(`${CATALOG_SERVICE_URL}/api/lenses/${input.lensId}`);
    if (!lensResponse.ok) {
      throw new Error('Lens not found');
    }
    const lens = await lensResponse.json() as Record<string, any>;

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) throw new Error('End date must be after start date');
    const totalPrice = (days * parseFloat(lens.dayPrice) * quantity).toFixed(2);

    const orderId = crypto.randomUUID();

    const reserveRes = await fetch(`${INVENTORY_SERVICE_URL}/api/inventory/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        lensId: input.lensId,
        branchCode: input.branchCode,
        quantity,
      }),
    });

    if (!reserveRes.ok) {
      const err = await reserveRes.json() as { error?: string };
      throw new Error(err.error || 'Failed to reserve stock');
    }

    const [order] = await db.insert(orders).values({
      id: orderId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      lensId: input.lensId,
      branchCode: input.branchCode,
      quantity,
      lensSnapshot: lens,
      startDate: start,
      endDate: end,
      totalPrice,
    }).returning();
    if (!order) {
      throw new Error('Failed to create order');
    }

    await publishOrderPlaced({
      orderId: order.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      lensModelName: lens.modelName,
    });

    return order;
  },

  async cancelOrder(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('ORDER_NOT_FOUND');
    if (order.status === 'cancelled') throw new Error('ORDER_ALREADY_CANCELLED');

    const [updated] = await db.update(orders)
      .set({ status: 'cancelled' })
      .where(eq(orders.id, orderId))
      .returning();

    await publishOrderCancelled({
      orderId: updated!.id,
      lensId: updated!.lensId,
      branchCode: updated!.branchCode,
      quantity: updated!.quantity ?? 1,
      customerName: updated!.customerName,
      customerEmail: updated!.customerEmail,
    });

    return updated;
  },

  async getOrderById(id: string) {
    const results = await db.select().from(orders).where(eq(orders.id, id));
    return results[0] || null;
  },

  async getAllOrders() {
    return db.select().from(orders);
  },
};
