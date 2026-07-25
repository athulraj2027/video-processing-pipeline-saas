import express, { Express, Request, Response, NextFunction } from 'express';
import { UserPayload } from './jwt';

export function createExpressApp(): Express {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    return app;
}
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
            tenantId?: string;
        }
    }
}

export type { Request, Response, NextFunction };