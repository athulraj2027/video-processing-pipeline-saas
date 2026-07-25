import { z } from 'zod';

export const logoutSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});
