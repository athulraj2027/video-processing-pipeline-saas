import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  scopes: z.array(z.string()).default(['*']),
  expiresAt: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()).optional(),
});

export type CreateApiKeyDto = z.infer<typeof createApiKeySchema>;
