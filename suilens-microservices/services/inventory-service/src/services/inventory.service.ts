import { db } from '../db';
import { branches, inventory, stockReleases } from '../db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export const InventoryService = {
  async getStockByLens(lensId: string) {
    const rows = await db.select({
      id: inventory.id,
      lensId: inventory.lensId,
      branchCode: inventory.branchCode,
      totalQuantity: inventory.totalQuantity,
      availableQuantity: inventory.availableQuantity,
      branchName: branches.name,
      branchLocation: branches.location,
      branchNotes: branches.notes,
    })
    .from(inventory)
    .innerJoin(branches, eq(inventory.branchCode, branches.code))
    .where(eq(inventory.lensId, lensId));

    return {
      lensId,
      branches: rows.map((r) => ({
        branchCode: r.branchCode,
        branchName: r.branchName,
        branchLocation: r.branchLocation,
        branchNotes: r.branchNotes,
        availableQuantity: r.availableQuantity,
        totalQuantity: r.totalQuantity,
      })),
    };
  },

  async getAllBranches() {
    return db.select().from(branches);
  },

  async reserveStock(orderId: string, lensId: string, branchCode: string, quantity: number) {
    const result = await db.update(inventory)
      .set({ availableQuantity: sql`${inventory.availableQuantity} - ${quantity}` })
      .where(and(
        eq(inventory.lensId, lensId),
        eq(inventory.branchCode, branchCode),
        gte(inventory.availableQuantity, quantity),
      ))
      .returning();

    if (result.length === 0) {
      throw new Error('INSUFFICIENT_STOCK');
    }
    return result[0];
  },

  async releaseStock(orderId: string, lensId: string, branchCode: string, quantity: number) {
    const existing = await db.select().from(stockReleases).where(eq(stockReleases.orderId, orderId));
    if (existing.length > 0) {
      console.log(`Stock already released for order ${orderId}, skipping`);
      return;
    }

    await db.transaction(async (tx) => {
      await tx.insert(stockReleases).values({ orderId, lensId, branchCode, quantity });

      await tx.update(inventory)
        .set({ availableQuantity: sql`${inventory.availableQuantity} + ${quantity}` })
        .where(and(
          eq(inventory.lensId, lensId),
          eq(inventory.branchCode, branchCode),
        ));
    });

    console.log(`Stock released for order ${orderId}: ${quantity} units at ${branchCode}`);
  },
};
