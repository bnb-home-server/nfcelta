import { pgTable, serial, text, timestamp, jsonb, decimal, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const receipts = pgTable('receipts', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  UF: text('uf').notNull(),
  metadata: jsonb('metadata'),
  htmlContent: text('html_content'),
  createdAt: timestamp('created_at').defaultNow(),
  totalPrice: decimal('total_price',{precision:10,scale:2}).$type<number>().notNull(),
});

export const receiptItems = pgTable('receipt_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  quantity: decimal('qtd',{precision:10,scale:2}).$type<number>().notNull(),
  unit: text('unit').notNull(),
  unitPrice: decimal('unit_price',{precision:10,scale:2}).$type<number>().notNull(),
  totalPrice: decimal('total_price',{precision:10,scale:2}).$type<number>().notNull(),
  receiptId: integer('receipt_id').references(()=> receipts.id)
});

export const receiptRelations = relations(receipts, ({ many }) => ({
  receiptItems: many(receiptItems),
}));

export const receiptItemsRelations = relations(receiptItems, ({ one }) => ({
  receipt: one(receipts,{
    fields:[receiptItems.receiptId],
    references: [receipts.id],
  }),
}));

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;

export type ReceiptItem = typeof receiptItems.$inferSelect;
export type NewReceiptItem = typeof receiptItems.$inferInsert;

export type ReceiptWithItems = Receipt & {
  receiptItems: ReceiptItem[];
};