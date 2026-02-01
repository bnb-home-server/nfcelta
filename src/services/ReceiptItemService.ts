import type { NewReceiptItem, ReceiptItem } from '../db/schema';
import type { IReceiptItemRepository, IReceiptItemService } from '../types';
import { ReceiptMetadataItem } from '../types/receipt';

export class ReceiptItemService implements IReceiptItemService {
  constructor(private receiptItemRepository: IReceiptItemRepository) {}

  async createReceiptItem(receiptId:number, metadataItem:ReceiptMetadataItem): Promise<ReceiptItem> {
    if (!receiptId || !metadataItem) {
      throw new Error('Receipt and Item are required');
    }

    const enrichedItem: NewReceiptItem = {
      receiptId: receiptId,
      name: metadataItem.name,
      quantity: parseFloat(metadataItem.quantity),
      totalPrice: parseFloat(metadataItem.totalPrice),
      unit: metadataItem.unit,
      unitPrice: parseFloat(metadataItem.unitPrice)
    };

    return await this.receiptItemRepository.create(enrichedItem);
  }

  async updateReceiptItem(id: number, receipt: Partial<NewReceiptItem>): Promise<ReceiptItem | null> {
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return await this.receiptItemRepository.update(id, receipt);
  }

  async deleteReceiptItem(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return await this.receiptItemRepository.delete(id);
  }
}
