import { db } from '../db';
import { receipts, type Receipt, type NewReceipt } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { IReceiptRepository } from '../types';

export class ReceiptRepository implements IReceiptRepository {
  async findAll(): Promise<Receipt[]> {
    return await db.query.receipts.findMany();
  }

  async findById(id: number): Promise<Receipt | null> {
    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, id),
    });
    return receipt || null;
  }

  async create(receipt: NewReceipt): Promise<Receipt> {
    const result = await db.insert(receipts).values(receipt).returning();
    return result[0];
  }

  async update(id: number, receipt: Partial<NewReceipt>): Promise<Receipt | null> {
    const result = await db
      .update(receipts)
      .set(receipt)
      .where(eq(receipts.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(receipts).where(eq(receipts.id, id));
    return true;
  }
}
