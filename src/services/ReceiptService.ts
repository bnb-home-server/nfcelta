import type { Receipt, NewReceipt } from '../db/schema';
import type { IReceiptRepository, IReceiptService } from '../types';
import { ScraperFactory } from '../scrapers/ScraperFactory';

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
    if (!receipt.code || !receipt.UF) {
      throw new Error('Code and UF are required');
    }

    // Get the appropriate scraper for the state
    const scraper = ScraperFactory.getScraper(receipt.UF);
    
    // Fetch data from scraper
    const scrapedData = await scraper.fetchData(receipt.code);

    // Merge scraped data with provided data
    const enrichedReceipt: NewReceipt = {
      ...receipt,
      metadata: receipt.metadata || scrapedData.metadata,
      htmlContent: receipt.htmlContent || scrapedData.htmlContent,
    };

    return await this.receiptRepository.create(enrichedReceipt);
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
