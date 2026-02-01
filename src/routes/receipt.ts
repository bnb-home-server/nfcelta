import { Context, Hono } from 'hono';
import { ReceiptController } from '../controllers/ReceiptController';
import { ReceiptService } from '../services/ReceiptService';
import { ReceiptRepository } from '../repositories/ReceiptRepository';
import { ReceiptItemService } from '../services/ReceiptItemService';
import { ReceiptItemRepository } from '../repositories/ReceiptItemRepository';

export function createReceiptRoutes(): Hono {
  const router = new Hono();
  
  // Dependency injection
  const receiptRepository = new ReceiptRepository();
  const receiptItemRepository = new ReceiptItemRepository()
  const receiptItemService = new ReceiptItemService(receiptItemRepository)
  const receiptService = new ReceiptService(receiptRepository,receiptItemService);
  const receiptController = new ReceiptController(receiptService);

  router.get('/', (c: Context) => receiptController.getAllReceipts(c));
  router.get('/:id', (c: Context) => receiptController.getReceiptById(c));
  router.get('/code/:code', (c: Context) => receiptController.getReceiptByCode(c));
  router.post('/', (c: Context) => receiptController.createReceipt(c));
  router.put('/:id', (c: Context) => receiptController.updateReceipt(c));
  router.delete('/:id', (c: Context) => receiptController.deleteReceipt(c));

  return router;
}
