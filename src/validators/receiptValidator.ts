import { z } from 'zod';

const UFStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'TO'
] as const;

export const createReceiptSchema = z.object({
  code: z.string().min(1, 'Code is required').trim(),
  UF: z.enum(UFStates).refine(
    (val) => UFStates.includes(val),
    { message: 'UF must be a valid Brazilian state code' }
  ),
  metadata: z.record(z.string(), z.any()).optional(),
  htmlContent: z.string().optional(),
});

export const updateReceiptSchema = z.object({
  code: z.string().min(1, 'Code is required').trim().optional(),
  UF: z.enum(UFStates).refine(
    (val) => UFStates.includes(val),
    { message: 'UF must be a valid Brazilian state code' }
  ).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  htmlContent: z.string().optional(),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;
