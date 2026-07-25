import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'Verification code must be exactly 6 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
