import { pgTable, uuid, varchar, integer, text, uniqueIndex, timestamp } from 'drizzle-orm/pg-core';

export const branches = pgTable('branches', {
  code: varchar('code', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  notes: text('notes'),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  lensId: uuid('lens_id').notNull(),
  branchCode: varchar('branch_code', { length: 20 }).notNull().references(() => branches.code),
  totalQuantity: integer('total_quantity').notNull(),
  availableQuantity: integer('available_quantity').notNull(),
}, (table) => [
  uniqueIndex('inventory_lens_branch_idx').on(table.lensId, table.branchCode),
]);

export const stockReleases = pgTable('stock_releases', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().unique(),
  lensId: uuid('lens_id').notNull(),
  branchCode: varchar('branch_code', { length: 20 }).notNull(),
  quantity: integer('quantity').notNull(),
  releasedAt: timestamp('released_at').defaultNow().notNull(),
});
