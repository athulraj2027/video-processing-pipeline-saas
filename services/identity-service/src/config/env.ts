import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load env files in development
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4001),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(8, 'REFRESH_TOKEN_SECRET must be at least 8 characters long'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration for Identity Service:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  
  return result.data;
}

export const env = validateEnv();
