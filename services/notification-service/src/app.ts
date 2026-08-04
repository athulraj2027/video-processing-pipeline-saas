import { createExpressApp } from './config/expressApp.js';
import { corsMiddleware } from './config/cors.js';
import notificationRouter from './routes/notification.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundError } from './middlewares/notFoundError.js';

export const app = createExpressApp();

app.use(corsMiddleware);

// API Routes
app.use('/api/v1/notifications', notificationRouter);

// Error handlers
app.use(notFoundError);
app.use(errorHandler);

export default app;
