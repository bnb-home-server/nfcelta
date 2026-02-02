import { Hono } from 'hono';
import { createReceiptRoutes } from './routes/receipt';
import { cors } from 'hono/cors';

const app = new Hono();


app.use(cors({
    origin: '*',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST','PUT','DELETE','PATCH', 'GET', 'OPTIONS'],
    maxAge: 600,
    credentials: true,
  }))
// Health check
app.get('/', (c) => {
  return c.json({ message: 'Server is running' });
});


// Routes
const receiptRoutes = createReceiptRoutes();
app.route('/receipts', receiptRoutes);

export default app;
