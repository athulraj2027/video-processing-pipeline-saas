import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If the error is custom operational, format and send
  if (err instanceof AppError) {
    const errorTypeMap: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
    };

    res.status(err.statusCode).json({
      error: errorTypeMap[err.statusCode] || 'Error',
      message: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  // Handle other uncaught/runtime errors
  console.error('💥 Unhandled Application Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
}
