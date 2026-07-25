import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

let store: any = undefined;

if (env.REDIS_URL) {
  console.log(`📡 Connecting to Redis for rate-limiting at ${env.REDIS_URL}...`);
  const redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on('error', (err: any) => {
    console.error('❌ Redis Rate Limiter Client Error:', err);
  });

  redisClient.connect().catch((err: any) => {
    console.error('❌ Failed to connect to Redis for rate limiting:', err);
  });

  store = new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });
} else {
  console.warn('⚠️  REDIS_URL not configured. Rate limiting falling back to in-memory store.');
}

export const tenantRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: env.NODE_ENV === 'test' ? 1000 : 120, // limit each IP or tenant
    standardHeaders: true,
    legacyHeaders: false,
    store: store,
    keyGenerator: (req) => {
        return req.tenantId || req.ip || 'unresolved';
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again in a minute.',
        });
    }
});