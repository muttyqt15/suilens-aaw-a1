// src/services/order.service.ts
import { db } from '../db';
import { orders, lenses, notifications } from '../db/schema';
import { eq } from 'drizzle-orm';

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  lensId: string;
  startDate: string;
  endDate: string;
}

export const OrderService = {
  async createOrder(input: CreateOrderInput) {
    return db.transaction(async (tx) => {
      const lens = await tx.select().from(lenses).where(eq(lenses.id, input.lensId));
      if (!lens[0]) {
        throw new Error('Lens not found');
      }

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 0) throw new Error('End date must be after start date');
      const totalPrice = (days * parseFloat(lens[0].dayPrice)).toFixed(2);

      const [order] = await tx.insert(orders).values({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        lensId: input.lensId,
        startDate: start,
        endDate: end,
        totalPrice,
      }).returning();
      if (!order) {
        throw new Error('Failed to create order');
      }

      await tx.insert(notifications).values({
        orderId: order.id,
        type: 'order_placed',
        recipient: input.customerEmail,
        message: `Hi ${input.customerName}, your rental order for ${lens[0].modelName} has been placed. Order ID: ${order.id}`,
      });

      return order;
    });
  },

  async getOrderById(id: string) {
    const results = await db.select().from(orders).where(eq(orders.id, id));
    return results[0] || null;
  },

  async getAllOrders() {
    return db.select().from(orders);
  },
};
