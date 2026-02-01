import type { IScraper, ScraperData } from './IScraper';
import type { ReceiptMetadata, ReceiptItem } from '../types/receipt';

export class ParanaScraper implements IScraper {
  private readonly baseUrl = 'https://www.fazenda.pr.gov.br/nfce/qrcode?p=';

  async fetchData(code: string): Promise<ScraperData> {
    try {
      const url = `${this.baseUrl}${code}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/html',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const scrapedData = this.parseHTML(html, code);

      return scrapedData;
    } catch (error) {
      throw new Error(`Failed to fetch data from Paraná for code ${code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseHTML(html: string, code: string): ScraperData {
    try {
      // Extract store name
      const storeMatch = html.match(/<div id="u20" class="txtTopo">([^<]+)<\/div>/);
      const storeName = storeMatch ? storeMatch[1].trim() : 'Unknown Store';

      // Extract total amount
      const totalMatch = html.match(/<label>Valor total R\$:<\/label>\s*<span class="totalNumb">([^<]+)<\/span>/);
      const totalAmount = totalMatch ? totalMatch[1].trim() : '0.00';

      // Extract amount to pay
      const amountToPay = html.match(/<label>Valor a pagar R\$:<\/label>\s*<span class="totalNumb txtMax">([^<]+)<\/span>/);
      const finalAmount = amountToPay ? amountToPay[1].trim() : totalAmount;

      // Extract CNPJ
      const cnpjMatch = html.match(/CNPJ:\s*([^<]+)<\/div>/);
      const cnpj = cnpjMatch ? cnpjMatch[1].trim() : '';

      // Extract invoice number
      const invoiceMatch = html.match(/<strong>Número: <\/strong>(\d+)/);
      const invoiceNumber = invoiceMatch ? invoiceMatch[1] : '';

      // Extract series
      const seriesMatch = html.match(/<strong> Série: <\/strong>(\d+)/);
      const series = seriesMatch ? seriesMatch[1] : '';

      // Extract emission date
      const dateMatch = html.match(/<strong> Emissão: <\/strong>([^<]+)\s+-/);
      const emissionDate = dateMatch ? dateMatch[1].trim() : '';

      // Extract authorization protocol
      const protocolMatch = html.match(/<strong>Protocolo de Autorização: <\/strong>(\d+)/);
      const protocol = protocolMatch ? protocolMatch[1] : '';

      // Extract access key
      const keyMatch = html.match(/<span class="chave">([^<]+)<\/span>/);
      const accessKey = keyMatch ? keyMatch[1].trim() : '';

      // Extract consumer CPF
      const cpfMatch = html.match(/<strong>CPF: <\/strong>([^<]+)<\/li>/);
      const consumerCpf = cpfMatch ? cpfMatch[1].trim() : '';

      // Extract consumer name
      const consumerMatch = html.match(/<strong>Nome: <\/strong>([^<]+)<\/li>/);
      const consumerName = consumerMatch ? consumerMatch[1].trim() : '';

      // Extract items
      const items = this.extractItems(html);

      // Extract discounts
      const discountMatch = html.match(/<label>Descontos R\$:<\/label>\s*<span class="totalNumb">([^<]+)<\/span>/);
      const discount = discountMatch ? discountMatch[1].trim() : '0.00';

      const metadata: ReceiptMetadata = {
        state: 'PR',
        source: 'paraná_nfce',
        storeName,
        cnpj,
        invoiceNumber,
        series,
        emissionDate,
        protocol,
        accessKey,
        consumerCpf,
        consumerName,
        itemsCount: items.length,
        discount,
        items,
      };

      return {
        code,
        storeName,
        totalAmount: finalAmount,
        description: `NFe ${invoiceNumber}/${series} - ${consumerName}`,
        metadata,
        htmlContent: html,
      };
    } catch (error) {
      return {
        code,
        storeName: 'Unknown Store',
        totalAmount: '0.00',
        description: 'Failed to parse response',
        htmlContent: html,
      };
    }
  }

  private extractItems(html: string): ReceiptItem[] {
    const items: ReceiptItem[] = [];

    // Match all item rows in the table
    const itemRegex = /<tr id="Item \+ \d+">[\s\S]*?<span class="txtTit2">([^<]+)<\/span>[\s\S]*?<span class="RCod">\(Código: ([^)]+)\)[\s\S]*?<strong>Qtde\.:<\/strong>([^<]+)[\s\S]*?<strong>UN: <\/strong>([^<]+)[\s\S]*?<strong>Vl\. Unit\.\:<\/strong>([^<]+)[\s\S]*?<span class="valor">([^<]+)<\/span>/g;

    let match;
    while ((match = itemRegex.exec(html)) !== null) {
      items.push({
        name: match[1].trim(),
        code: match[2].trim(),
        quantity: match[3].trim(),
        unit: match[4].trim(),
        unitPrice: match[5].trim(),
        totalPrice: match[6].trim(),
      });
    }

    return items;
  }
}

