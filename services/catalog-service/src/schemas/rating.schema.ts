import { z } from 'zod';

export const createRatingSchema = z.object({
  filmId: z.string().min(1, 'Film ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  reviewTitle: z.string().nullable().optional(),
  reviewBody: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
});

export const updateRatingSchema = createRatingSchema.omit({ filmId: true }).partial();

export type CreateRatingDto = z.infer<typeof createRatingSchema>;
export type UpdateRatingDto = z.infer<typeof updateRatingSchema>;
