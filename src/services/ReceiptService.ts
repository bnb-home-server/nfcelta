import type { Receipt, NewReceipt, ReceiptItem } from '../db/schema';
import type { IReceiptItemService, IReceiptRepository, IReceiptService } from '../types';
import { ScraperFactory } from '../scrapers/ScraperFactory';

export class ReceiptService implements IReceiptService {
  constructor(private receiptRepository: IReceiptRepository,private receiptItemService: IReceiptItemService) {}

  async getAllReceipts(): Promise<Receipt[]> {
    return await this.receiptRepository.findAll();
  }

  async getReceiptById(id: number): Promise<Receipt | null> {
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return await this.receiptRepository.findById(id);
  }

  async getReceiptByCode(code: string): Promise<Receipt | null> {
    if (code.length <= 0) {
      throw new Error('Code must be a valid string');
    }

    return await this.receiptRepository.findByCode(code);
  }


  async createReceipt(receipt: NewReceipt): Promise<ReceiptItem[]|null> {
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
      totalPrice:  receipt.totalPrice || parseFloat(scrapedData.totalAmount ?? '0')
    };

    const storedReceipt = await this.receiptRepository.create(enrichedReceipt);

    if(scrapedData.metadata?.items){
        for(let item of scrapedData.metadata?.items){
           await this.receiptItemService.createReceiptItem(storedReceipt.id,item)
        }
    }

    return this.receiptRepository.findItemsByCode(storedReceipt.code)
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
