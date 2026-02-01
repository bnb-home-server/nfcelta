import { db } from '../db';
import { receiptItems, type Receipt, type NewReceiptItem, ReceiptItem } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { IReceiptItemRepository } from '../types';

export class ReceiptItemRepository implements IReceiptItemRepository {

  async findById(id: number): Promise<ReceiptItem | null> {
    const receiptItem = await db.query.receiptItems.findFirst({
      where: eq(receiptItems.id, id),
    });
    return receiptItem || null;
  }

  async create(receipt: NewReceiptItem): Promise<ReceiptItem> {
    const result = await db.insert(receiptItems).values(receipt).returning();
    return result[0];
  }

  async update(id: number, receipt: Partial<NewReceiptItem>): Promise<ReceiptItem | null> {
    const result = await db
      .update(receiptItems)
      .set(receipt)
      .where(eq(receiptItems.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(receiptItems).where(eq(receiptItems.id, id));
    return true;
  }
}
