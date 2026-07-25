import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/appError.js';

export function notFoundError(req: Request, res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
