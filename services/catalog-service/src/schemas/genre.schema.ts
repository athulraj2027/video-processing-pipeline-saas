import { z } from 'zod';

export const createGenreSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric or hyphens in lowercase'),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateGenreSchema = createGenreSchema.partial();

export type CreateGenreDto = z.infer<typeof createGenreSchema>;
export type UpdateGenreDto = z.infer<typeof updateGenreSchema>;
