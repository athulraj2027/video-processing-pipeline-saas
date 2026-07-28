import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load env files in development
// 1. Load local .env (inside services/api-gateway/) first so it takes precedence
const localEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: localEnvPath });

// 2. Load root .env (inside the monorepo root) as a fallback for shared variables
const rootEnvPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: rootEnvPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  REDIS_URL: z.string().url().optional(),

  // Downstream service target URLs
  IDENTITY_SERVICE_URL: z.string().url().default('http://localhost:4001'),
  CATALOG_SERVICE_URL: z.string().url().default('http://localhost:4002'),
  UPLOAD_SERVICE_URL: z.string().url().default('http://localhost:4003'),
  PLAYBACK_SERVICE_URL: z.string().url().default('http://localhost:4004'),
  TENANT_SERVICE_URL: z.string().url().default('http://localhost:4005'),
  ENTITLEMENT_SERVICE_URL: z.string().url().default('http://localhost:4006'),
  BILLING_SERVICE_URL: z.string().url().default('http://localhost:4007'),
  PAYMENTS_SERVICE_URL: z.string().url().default('http://localhost:4008'),
  ANALYTICS_SERVICE_URL: z.string().url().default('http://localhost:4009'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:4010'),
  SUPPORT_SERVICE_URL: z.string().url().default('http://localhost:4011'),
  JOB_ORCHESTRATOR_URL: z.string().url().default('http://localhost:4012'),

  // Local tenant hostname-to-ID mapping fallback
  // Format: "domain1.com=tenant_abc,domain2.com=tenant_xyz"
  TENANT_MAPPING: z
    .string()
    .default('localhost:3000=tenant_default,studio.localhost:3000=tenant_studio'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
