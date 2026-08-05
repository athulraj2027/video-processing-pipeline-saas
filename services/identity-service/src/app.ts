import { createExpressApp } from './config/expressApp.js';
import { corsMiddleware } from './config/cors.js';
import authRouter from './routes/auth.js';
import { errorHandler, cookieParser, notFoundError, idempotency } from './middlewares/middleware.js';

export const app = createExpressApp();

app.use(corsMiddleware);
app.use(cookieParser);
app.use(idempotency);
app.use('/api/v1/auth', authRouter);
app.use(notFoundError);
app.use(errorHandler);

export default app;
