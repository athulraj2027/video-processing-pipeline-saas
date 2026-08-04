import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load env files in development
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4010),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // SMTP Settings
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('flow studio <noreply@flowstudio.com>'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration for Notification Service:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  
  return result.data;
}

export const env = validateEnv();
