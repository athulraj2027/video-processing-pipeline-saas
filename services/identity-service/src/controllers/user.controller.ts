import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'User context is missing' });
    return;
  }

  const user = await authService.getUserById(req.user.id);
  res.json({ user });
});
