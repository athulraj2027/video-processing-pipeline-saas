import { z } from 'zod';

export const createWatchlistItemSchema = z.object({
  filmId: z.string().min(1, 'Film ID is required'),
  notes: z.string().nullable().optional(),
});

export type CreateWatchlistItemDto = z.infer<typeof createWatchlistItemSchema>;
