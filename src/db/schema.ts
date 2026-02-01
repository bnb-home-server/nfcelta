import { pgTable, serial, text, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';

export const receipts = pgTable('receipts', {
  id: serial('id').primaryKey(),
  storeName: text('store_name').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  htmlContent: text('html_content'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
