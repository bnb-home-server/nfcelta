import { Hono } from 'hono';
import { createReceiptRoutes } from './routes/receipt';
import { cors } from 'hono/cors';

const app = new Hono();


app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['*'],
    exposeHeaders: ['*'],
    maxAge: 86400,
    credentials: false, // must be false when origin is '*'
  }))
// Health check
app.get('/', (c) => {
  return c.json({ message: 'Server is running' });
});


// Routes
const receiptRoutes = createReceiptRoutes();
app.route('/receipts', receiptRoutes);

export default app;
