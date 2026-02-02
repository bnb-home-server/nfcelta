import { ReceiptController } from '../controllers/ReceiptController';
import type { Receipt, NewReceipt, ReceiptItem, NewReceiptItem, ReceiptWithItems } from '../db/schema';
import { ReceiptRepository } from '../repositories/ReceiptRepository';
import { ReceiptMetadataItem } from './receipt';

export type Env = {
  Variables: {
    receiptController: ReceiptController;
    receiptRepository: ReceiptRepository;
  };
};

export interface IReceiptRepository {
  findAll(limit?: number, offset?: number): Promise<Receipt[]>;
  count(): Promise<number>;
  findById(id: number): Promise<ReceiptWithItems | null>;
  findByCode(code: string): Promise<ReceiptWithItems | null>;
  findItemsByCode(code: string): Promise<ReceiptItem[]|null>
  create(receipt: NewReceipt): Promise<Receipt>;
  update(id: number, receipt: Partial<NewReceipt>): Promise<Receipt | null>;
  delete(id: number): Promise<boolean>;
}

export interface IReceiptService {
  getAllReceipts(page?: number, limit?: number): Promise<{ data: Receipt[], page: number, limit: number, total: number }>;
  getReceiptById(id: number): Promise<ReceiptWithItems | null>;
  getReceiptByCode(code: string): Promise<ReceiptWithItems | null>;
  createReceipt(receipt: NewReceipt): Promise<ReceiptItem[]| null>;
  updateReceipt(id: number, receipt: Partial<NewReceipt>): Promise<Receipt | null>;
  deleteReceipt(id: number): Promise<boolean>;
}

export interface IReceiptItemRepository {
  create(receipt: NewReceiptItem): Promise<ReceiptItem>;
  update(id: number, receipt: Partial<NewReceiptItem>): Promise<ReceiptItem | null>;
  delete(id: number): Promise<boolean>;
}

export interface IReceiptItemService {
  createReceiptItem(receiptId: number, receiptItem: ReceiptMetadataItem): Promise<ReceiptItem>;
  updateReceiptItem(id: number, receiptItem: Partial<NewReceiptItem>): Promise<ReceiptItem | null>;
  deleteReceiptItem(id: number): Promise<boolean>;
}
