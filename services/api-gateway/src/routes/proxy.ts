import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { buildProxyOptions } from '../config/proxyOptions.js';
import { authRateLimiter } from '../middlewares/rate-limiter.js';

const router = Router();

// 1. Identity & Authentication Service
router.use(
  '/api/v1/auth',
  authRateLimiter,
  optionalAuthenticate,
  createProxyMiddleware(buildProxyOptions(env.IDENTITY_SERVICE_URL, '/api/v1/auth'))
);

// 2. Catalog Service
router.use(
  '/api/v1/catalog',
  optionalAuthenticate,
  createProxyMiddleware(buildProxyOptions(env.CATALOG_SERVICE_URL, '/api/v1/catalog'))
);

// 3. Upload Service
router.use(
  '/api/v1/upload',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.UPLOAD_SERVICE_URL, '/api/v1/upload'))
);

// 4. Playback Service
router.use(
  '/api/v1/playback',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.PLAYBACK_SERVICE_URL, '/api/v1/playback'))
);

// 5. Tenant Service
router.use(
  '/api/v1/tenants',
  optionalAuthenticate,
  createProxyMiddleware(buildProxyOptions(env.TENANT_SERVICE_URL, '/api/v1/tenants'))
);

// 6. Entitlement Service
router.use(
  '/api/v1/entitlements',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.ENTITLEMENT_SERVICE_URL, '/api/v1/entitlements'))
);

// 7. Billing Service
router.use(
  '/api/v1/billing',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.BILLING_SERVICE_URL, '/api/v1/billing'))
);

// 8. Payments Service
router.use(
  '/api/v1/payments',
  optionalAuthenticate,
  createProxyMiddleware(buildProxyOptions(env.PAYMENTS_SERVICE_URL, '/api/v1/payments'))
);

// 9. Analytics Service
router.use(
  '/api/v1/analytics',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.ANALYTICS_SERVICE_URL, '/api/v1/analytics'))
);

// 10. Notification Service
router.use(
  '/api/v1/notifications',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.NOTIFICATION_SERVICE_URL, '/api/v1/notifications'))
);

// 11. Support Service
router.use(
  '/api/v1/support',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.SUPPORT_SERVICE_URL, '/api/v1/support'))
);

// 12. Job Orchestrator
router.use(
  '/api/v1/jobs',
  authenticate,
  createProxyMiddleware(buildProxyOptions(env.JOB_ORCHESTRATOR_URL, '/api/v1/jobs'))
);

export default router;
