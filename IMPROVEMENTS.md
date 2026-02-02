# NFCelta - Recommended Improvements

This document outlines recommended improvements for the NFCelta application, organized by priority.

## Critical Issues

### 1. Fix Repository Count Method
**File**: `src/repositories/ReceiptRepository.ts:15-18`

**Current (Incorrect)**:
```typescript
async count(): Promise<number> {
  const result = await db.select({ count: receipts.id }).from(receipts);
  return result.length; // ❌ This returns array length, not total count
}
```

**Should be**:
```typescript
import { sql } from 'drizzle-orm';

async count(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(receipts);
  return Number(result[0].count);
}
```

### 2. Complete Docker Production Build
The production setup is almost ready, but you need to test it fully works.

### 3. Generate Database Migrations
Run migrations for production:
```bash
bun run db:generate
bun run db:migrate
```

---

## High Priority Improvements

### 4. Add Error Logging/Monitoring
Currently errors are just returned to users. Add proper logging.

**Create**: `src/lib/logger.ts`
```typescript
export const logger = {
  error: (message: string, error: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Add external monitoring (Sentry, DataDog, etc.)
  },
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`)
};
```

**Usage in controllers**:
```typescript
} catch (error) {
  logger.error('Failed to fetch receipt', error as Error);
  return c.json({ error: 'Internal server error' }, 500);
}
```

### 5. Add Scraper Retry Logic
**File**: `src/scrapers/ParanaScraper.ts:7-30`

```typescript
async fetchData(code: string, retries = 3): Promise<ScraperData> {
  for (let i = 0; i < retries; i++) {
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
      return this.parseHTML(html, code);
      
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  throw new Error('Retry logic failed'); // TypeScript safety
}
```

### 6. Add Request Rate Limiting
Protect the scraper endpoints from abuse and respect external APIs.

```bash
bun add @hono/rate-limiter
```

```typescript
import { rateLimiter } from '@hono/rate-limiter'

// Apply to scraper endpoint
app.use('/receipts', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));
```

### 7. Standardize Error Responses
Create consistent error format across all endpoints.

**Create**: `src/lib/errors.ts`
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export const errorHandler = (error: Error | AppError) => {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }
  
  return {
    error: 'Internal server error',
    statusCode: 500
  };
};
```

**Usage in controllers**:
```typescript
if (!receipt) {
  throw new AppError(404, 'Receipt not found', 'RECEIPT_NOT_FOUND');
}
```

---

## Medium Priority

### 8. Environment Variable Validation
Add validation on startup to catch configuration errors early.

**Create**: `src/config/env.ts`
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().default('3000')
});

export const env = envSchema.parse(process.env);
```

**Usage**:
```typescript
import { env } from './config/env';

// Use env.DATABASE_URL instead of process.env.DATABASE_URL
```

### 9. Add Health Check Endpoint
For monitoring and load balancers.

**File**: `src/index.ts`
```typescript
import { sql } from 'drizzle-orm';
import { db } from './db';

app.get('/health', async (c) => {
  try {
    // Check database connectivity
    await db.execute(sql`SELECT 1`);
    
    return c.json({ 
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  } catch (error) {
    return c.json({ 
      status: 'unhealthy',
      error: 'Database connection failed'
    }, 503);
  }
});
```

### 10. Replace Regex HTML Parsing
Use proper HTML parser for more reliable scraping.

```bash
bun add cheerio
bun add -d @types/cheerio
```

**File**: `src/scrapers/ParanaScraper.ts`
```typescript
import * as cheerio from 'cheerio';

private parseHTML(html: string, code: string): ScraperData {
  const $ = cheerio.load(html);
  
  // Much more reliable than regex
  const storeName = $('#u20.txtTopo').text().trim();
  const totalAmount = $('label:contains("Valor total R$:")').next('.totalNumb').text().trim();
  const cnpj = $('div:contains("CNPJ:")').text().replace('CNPJ:', '').trim();
  
  // ... continue for other fields
}

private extractItems(html: string): ReceiptMetadataItem[] {
  const $ = cheerio.load(html);
  const items: ReceiptMetadataItem[] = [];
  
  $('tr[id^="Item"]').each((_, element) => {
    items.push({
      name: $(element).find('.txtTit2').text().trim(),
      code: $(element).find('.RCod').text().replace(/[()]/g, '').replace('Código: ', '').trim(),
      quantity: $(element).find('strong:contains("Qtde.")').parent().text().replace('Qtde.:', '').trim(),
      unit: $(element).find('strong:contains("UN:")').parent().text().replace('UN:', '').trim(),
      unitPrice: $(element).find('strong:contains("Vl. Unit.")').parent().text().replace('Vl. Unit.:', '').trim(),
      totalPrice: $(element).find('.valor').text().trim()
    });
  });
  
  return items;
}
```

### 11. Add Caching for Scraped Data
Avoid re-scraping the same receipt.

**File**: `src/services/ReceiptService.ts`
```typescript
async createReceipt(receipt: NewReceipt): Promise<ReceiptItem[]|null> {
  if (!receipt.code || !receipt.UF) {
    throw new Error('Code and UF are required');
  }

  // Check if receipt already exists
  const existing = await this.receiptRepository.findByCode(receipt.code);
  if (existing) {
    return existing.receiptItems || [];
  }

  // Get the appropriate scraper for the state
  const scraper = ScraperFactory.getScraper(receipt.UF);
  
  // ... rest of existing logic
}
```

### 12. Add API Authentication
Protect your endpoints from unauthorized access.

```bash
bun add hono-jwt-auth
```

```typescript
import { jwt } from 'hono/jwt'

// Protect all receipt endpoints
app.use('/receipts/*', jwt({ 
  secret: process.env.JWT_SECRET || 'your-secret-key' 
}))

// Or use API keys
app.use('/receipts/*', async (c, next) => {
  const apiKey = c.req.header('X-API-Key');
  if (apiKey !== process.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
```

---

## Long-term Improvements

### 13. Add More State Scrapers
Currently only supports PR (Paraná). Add scrapers for other Brazilian states:

**Priority states**:
- SP (São Paulo) - Largest state
- RJ (Rio de Janeiro)
- MG (Minas Gerais)
- RS (Rio Grande do Sul)
- SC (Santa Catarina)

**Create**: `src/scrapers/SaoPauloScraper.ts`, etc.
```typescript
export class SaoPauloScraper implements IScraper {
  private readonly baseUrl = 'https://www.fazenda.sp.gov.br/...';
  
  async fetchData(code: string): Promise<ScraperData> {
    // SP-specific implementation
  }
}
```

**Register in**: `src/scrapers/ScraperFactory.ts`
```typescript
static {
  ScraperFactory.scrapers.set('PR', new ParanaScraper());
  ScraperFactory.scrapers.set('SP', new SaoPauloScraper());
  ScraperFactory.scrapers.set('RJ', new RioDeJaneiroScraper());
  // ...
}
```

### 14. Background Job Queue
Move scraping to background jobs to prevent timeouts on slow scrapes.

```bash
bun add bullmq ioredis
```

**Create**: `src/queues/scraper.queue.ts`
```typescript
import { Queue, Worker } from 'bullmq';

export const scraperQueue = new Queue('scraper', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

export const scraperWorker = new Worker('scraper', async (job) => {
  const { code, UF } = job.data;
  const scraper = ScraperFactory.getScraper(UF);
  const data = await scraper.fetchData(code);
  return data;
});
```

**Usage in service**:
```typescript
async createReceipt(receipt: NewReceipt): Promise<{ jobId: string }> {
  const job = await scraperQueue.add('scrape', { 
    code: receipt.code, 
    UF: receipt.UF 
  });
  
  return { jobId: job.id };
}
```

### 15. Add Tests
Add unit and integration tests.

```bash
bun add -d vitest @types/supertest supertest
```

**Create**: `src/__tests__/services/ReceiptService.test.ts`
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ReceiptService } from '../../services/ReceiptService';

describe('ReceiptService', () => {
  it('should get receipt by id', async () => {
    // Test implementation
  });
  
  it('should throw error for invalid id', async () => {
    // Test implementation
  });
});
```

**Update**: `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### 16. API Documentation
Add OpenAPI/Swagger documentation.

```bash
bun add @hono/zod-openapi
```

**Create**: `src/openapi.ts`
```typescript
import { OpenAPIHono } from '@hono/zod-openapi';
import { createReceiptSchema } from './validators/receiptValidator';

const app = new OpenAPIHono();

app.openapi({
  method: 'post',
  path: '/receipts',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createReceiptSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Receipt created successfully'
    }
  }
});
```

### 17. Metrics & Analytics
Track application metrics and usage patterns.

**Metrics to track**:
- Scraping success/failure rates by state
- Most queried receipts
- Response times
- State distribution
- Cache hit rates

**Tools to consider**:
- Prometheus + Grafana
- DataDog
- New Relic
- Custom logging to database

---

## Quick Wins (Do These Now)

Priority tasks you can complete quickly:

1. ✅ **Fix the count method** (~5 minutes)
2. ✅ **Add health check endpoint** (~5 minutes)
3. ✅ **Add retry logic to scraper** (~10 minutes)
4. ✅ **Validate environment variables** (~10 minutes)
5. ✅ **Check if receipt exists before re-scraping** (~5 minutes)

**Total time**: ~35 minutes for significant improvements

---

## Implementation Order

Recommended implementation sequence:

### Phase 1 - Critical (Week 1)
1. Fix count method
2. Add health check
3. Test and complete Docker production setup
4. Add error logging

### Phase 2 - Stability (Week 2)
5. Add retry logic
6. Add rate limiting
7. Environment variable validation
8. Standardize errors
9. Add caching

### Phase 3 - Reliability (Week 3-4)
10. Replace regex with cheerio
11. Add authentication
12. Add tests
13. Add more state scrapers

### Phase 4 - Scale (Month 2+)
14. Background job queue
15. API documentation
16. Metrics & analytics
17. Performance optimization

---

## Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Vitest Documentation](https://vitest.dev/)
