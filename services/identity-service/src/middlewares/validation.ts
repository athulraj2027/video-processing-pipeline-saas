import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../errors/appError.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      next(new BadRequestError('Validation failed', parseResult.error.format()));
      return;
    }
    // Assign validated data back to req.body
    req.body = parseResult.data;
    next();
  };
}
