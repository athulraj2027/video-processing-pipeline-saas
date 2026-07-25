import { tenantResolver } from './middlewares/tenant-resolver.js';
import proxyRouter from './routes/proxy.js';
import { tenantRateLimiter } from './middlewares/rate-limiter.js';
import { corsMiddleware } from './config/cors.js';
import { createExpressApp } from './config/expressApp.js';
import healthRouter from './routes/health.js';

export const app = createExpressApp()

app.use(corsMiddleware)
app.use(tenantResolver);
app.use(healthRouter)
app.use(tenantRateLimiter);
app.use(proxyRouter);
