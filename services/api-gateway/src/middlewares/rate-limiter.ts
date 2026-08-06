import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

let redisClient: any = undefined;

if (env.REDIS_URL) {
  console.log(`📡 Connecting to Redis for rate-limiting at ${env.REDIS_URL}...`);
  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on('error', (err: any) => {
    console.error('❌ Redis Rate Limiter Client Error:', err);
  });

  redisClient.connect().catch((err: any) => {
    console.error('❌ Failed to connect to Redis for rate limiting:', err);
  });
} else {
  console.warn('⚠️  REDIS_URL not configured. Rate limiting falling back to in-memory store.');
}

// Creates a new RedisStore instance for each rate limiter to avoid sharing stores
const createStore = (prefix: string) => {
  if (!redisClient) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`,
  });
};

export const tenantRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: env.NODE_ENV === 'test' ? 1000 : 120, // limit each IP or tenant
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("tenant"),
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

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: env.NODE_ENV === 'test' ? 1000 : 15, // limit each IP to 15 auth requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("auth"),
    keyGenerator: (req) => {
        return req.ip || 'unresolved-ip';
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
        });
    }
});