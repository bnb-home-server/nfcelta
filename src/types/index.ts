import type { Receipt, NewReceipt } from '../db/schema';

export interface IReceiptRepository {
  findAll(): Promise<Receipt[]>;
  findById(id: number): Promise<Receipt | null>;
  create(receipt: NewReceipt): Promise<Receipt>;
  update(id: number, receipt: Partial<NewReceipt>): Promise<Receipt | null>;
  delete(id: number): Promise<boolean>;
}

export interface IReceiptService {
  getAllReceipts(): Promise<Receipt[]>;
  getReceiptById(id: number): Promise<Receipt | null>;
  createReceipt(receipt: NewReceipt): Promise<Receipt>;
  updateReceipt(id: number, receipt: Partial<NewReceipt>): Promise<Receipt | null>;
  deleteReceipt(id: number): Promise<boolean>;
}
