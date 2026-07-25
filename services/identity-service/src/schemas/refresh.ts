import { z } from 'zod';

export const refreshSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});
