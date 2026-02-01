import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const receipts = pgTable('receipts', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  UF: text('uf').notNull(),
  metadata: jsonb('metadata'),
  htmlContent: text('html_content'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
