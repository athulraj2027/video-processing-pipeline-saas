import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

export const getHealth = catchAsync(async (req: Request, res: Response) => {
  let dbStatus = 'UP';
  try {
    // Validate database connectivity through service lookup
    await authService.getUserById('health-check-id-non-existent').catch(err => {
      if (err.message !== 'User profile not found') {
        dbStatus = 'DOWN';
      }
    });
  } catch (err) {
    dbStatus = 'DOWN';
  }

  res.json({
    status: 'UP',
    service: 'identity-service',
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
