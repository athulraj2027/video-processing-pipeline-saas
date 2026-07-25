import { createExpressApp } from './config/expressApp.js';
import { corsMiddleware } from './config/cors.js';
import tenantRouter from './routes/tenant.routes.js';
import { errorHandler, notFoundError } from './middlewares/middleware.js';

export const app = createExpressApp();

app.use(corsMiddleware);

// Register base routes
app.use('/api/v1/tenants', tenantRouter);

// Error handlers
app.use(notFoundError);
app.use(errorHandler);

export default app;
