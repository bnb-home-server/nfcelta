import type { IScraper } from './IScraper';
import { ParanaScraper } from './ParanaScraper';

export class ScraperFactory {
  private static scrapers: Map<string, IScraper> = new Map();

  static {
    // Register scrapers for each state
    ScraperFactory.scrapers.set('PR', new ParanaScraper());
  }

  static getScraper(uf: string): IScraper {
    const scraper = this.scrapers.get(uf);
    
    if (!scraper) {
      throw new Error(`No scraper found for state: ${uf}`);
    }
    
    return scraper;
  }

  static registerScraper(uf: string, scraper: IScraper): void {
    this.scrapers.set(uf, scraper);
  }
}
