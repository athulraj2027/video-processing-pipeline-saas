import { createExpressApp, Request, Response, NextFunction } from './config/expressApp.js';
import { corsMiddleware } from './config/cors.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { cookieParser } from './middlewares/cookieParser.js';

export const app = createExpressApp();

app.use(corsMiddleware);
app.use(cookieParser);
app.use('/api/v1/auth', authRouter);
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.url} not found` });
});

app.use(errorHandler);

export default app;
