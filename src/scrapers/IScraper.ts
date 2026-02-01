import type { ReceiptMetadata } from '../types/receipt';

export interface ScraperData {
  code: string;
  storeName?: string;
  totalAmount?: string;
  description?: string;
  metadata?: ReceiptMetadata;
  htmlContent?: string;
}

export interface IScraper {
  fetchData(code: string): Promise<ScraperData>;
}
