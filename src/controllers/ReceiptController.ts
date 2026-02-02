import type { Context } from 'hono';
import type { IReceiptService } from '../types';
import type { NewReceipt, Receipt } from '../db/schema';
import { createReceiptSchema, updateReceiptSchema } from '../validators/receiptValidator';

export class ReceiptController {
  constructor(private receiptService: IReceiptService) {}

  async getAllReceipts(c: Context) {
    try {
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);

      if (page < 1 || limit < 1 || limit > 100) {
        return c.json({ error: 'Invalid pagination parameters' }, 400);
      }

      const receipts = await this.receiptService.getAllReceipts(page, limit);
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

async getReceiptByCode(c: Context) {
    try {
      const code = c.req.param('code');
      const receipt = await this.receiptService.getReceiptByCode(code);

      if (!receipt) {
        return c.json({ error: 'Receipt not found' }, 404);
      }

      const response = {
        id: receipt.id,
        code: receipt.code,
        UF: receipt.UF,
        totalPrice: receipt.totalPrice,
        createdAt: receipt.createdAt,
        receiptItems: receipt.receiptItems || []
      };

      return c.json(response, 200);
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
      const body = await c.req.json();
      const validation = createReceiptSchema.safeParse(body);

      if (!validation.success) {
        return c.json(
          { 
            error: 'Validation error', 
            details: validation.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          400
        );
      }

      const receipt = await this.receiptService.createReceipt(validation.data as NewReceipt);
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
      const body = await c.req.json();
      const validation = updateReceiptSchema.safeParse(body);

      if (!validation.success) {
        return c.json(
          { 
            error: 'Validation error', 
            details: validation.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          400
        );
      }

      const receipt = await this.receiptService.updateReceipt(id, validation.data as Partial<NewReceipt>);

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
