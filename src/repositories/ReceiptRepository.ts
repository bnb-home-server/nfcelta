import { db } from '../db';
import { receipts, type Receipt, type NewReceipt, ReceiptItem, ReceiptWithItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { IReceiptRepository } from '../types';

export class ReceiptRepository implements IReceiptRepository {
  async findAll(limit?: number, offset?: number): Promise<Receipt[]> {
    return await db.query.receipts.findMany({
      limit,
      offset,
      orderBy: (receipts, { desc }) => [desc(receipts.createdAt)]
    });
  }

  async count(): Promise<number> {
    const result = await db.select({ count: receipts.id }).from(receipts);
    return result.length;
  }

  async findById(id: number): Promise<ReceiptWithItems | null> {
    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, id),
      with: {
        receiptItems:true
      }
    });
    return receipt || null;
  }

  async findByCode(code: string): Promise<ReceiptWithItems | null> {
    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.code, code),
      with:{
        receiptItems:true
      }
    });
    return receipt || null;
  }

  async findItemsByCode(code: string): Promise<ReceiptItem[] | null> {
    const receipt = await db.query.receipts.findFirst({
        where: eq(receipts.code, code),
        with: {
            receiptItems: true
        },
    });

    return receipt?.receiptItems || null
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
