import type { Context } from 'hono';
import type { IReceiptService } from '../types';
import type { NewReceipt } from '../db/schema';

export class ReceiptController {
  constructor(private receiptService: IReceiptService) {}

  async getAllReceipts(c: Context) {
    try {
      const receipts = await this.receiptService.getAllReceipts();
      return c.json(receipts, 200);
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }

  async getReceiptById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10);
      const receipt = await this.receiptService.getReceiptById(id);

      if (!receipt) {
        return c.json({ error: 'Receipt not found' }, 404);
      }

      return c.json(receipt, 200);
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        400
      );
    }
  }

  async createReceipt(c: Context) {
    try {
      const body = await c.req.json() as NewReceipt;
      const receipt = await this.receiptService.createReceipt(body);
      return c.json(receipt, 201);
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        400
      );
    }
  }

  async updateReceipt(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10);
      const body = await c.req.json() as Partial<NewReceipt>;
      const receipt = await this.receiptService.updateReceipt(id, body);

      if (!receipt) {
        return c.json({ error: 'Receipt not found' }, 404);
      }

      return c.json(receipt, 200);
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        400
      );
    }
  }

  async deleteReceipt(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10);
      const success = await this.receiptService.deleteReceipt(id);

      if (!success) {
        return c.json({ error: 'Receipt not found' }, 404);
      }

      return c.json({ message: 'Receipt deleted successfully' }, 200);
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        400
      );
    }
  }
}
