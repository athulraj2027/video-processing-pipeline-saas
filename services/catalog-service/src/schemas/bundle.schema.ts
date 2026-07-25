import { z } from 'zod';

export const createBundleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric or hyphens in lowercase'),
  description: z.string().nullable().optional(),
  status: z.string().default('draft'),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().min(3).max(3).default('USD'),
  metadata: z.record(z.any()).optional(),
  filmIds: z.array(z.string()).optional(),
});

export const updateBundleSchema = createBundleSchema.partial();

export type CreateBundleDto = z.infer<typeof createBundleSchema>;
export type UpdateBundleDto = z.infer<typeof updateBundleSchema>;
