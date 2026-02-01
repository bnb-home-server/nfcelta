import type { Receipt, NewReceipt } from '../db/schema';
import type { IReceiptRepository, IReceiptService } from '../types';

export class ReceiptService implements IReceiptService {
  constructor(private receiptRepository: IReceiptRepository) {}

  async getAllReceipts(): Promise<Receipt[]> {
    return await this.receiptRepository.findAll();
  }

  async getReceiptById(id: number): Promise<Receipt | null> {
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return await this.receiptRepository.findById(id);
  }

  async createReceipt(receipt: NewReceipt): Promise<Receipt> {
    if (!receipt.storeName || !receipt.totalAmount) {
      throw new Error('Store name and total amount are required');
    }
    return await this.receiptRepository.create(receipt);
  }

  async updateReceipt(id: number, receipt: Partial<NewReceipt>): Promise<Receipt | null> {
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return await this.receiptRepository.update(id, receipt);
  }

  async deleteReceipt(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return await this.receiptRepository.delete(id);
  }
}
