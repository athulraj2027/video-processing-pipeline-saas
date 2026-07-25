import { createExpressApp } from './config/expressApp.js';
import { corsMiddleware } from './config/cors.js';
import catalogRouter from './routes/index.js';
import { errorHandler, notFoundError } from './middlewares/middleware.js';

export const app = createExpressApp();

app.use(corsMiddleware);

// Register base routes under /api/v1/catalog
app.use('/api/v1/catalog', catalogRouter);

// Error handlers
app.use(notFoundError);
app.use(errorHandler);

export default app;
