import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load env files in development
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4002),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration for Catalog Service:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  
  return result.data;
}

export const env = validateEnv();
