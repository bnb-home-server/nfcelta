import { Hono } from 'hono';
import { createReceiptRoutes } from './routes/receipt';

const app = new Hono();

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Server is running' });
});


// Routes
const receiptRoutes = createReceiptRoutes();
app.route('/receipts', receiptRoutes);

export default app;
