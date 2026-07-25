import { Request, Response } from 'express';
import { env } from '../config/env.js';
import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role, tenantId } = req.body;

  const result = await authService.signup({
    email,
    passwordHash: password,
    role,
    tenantId,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({
    email,
    passwordHash: password,
  });

  // Set refresh token in HttpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: result.expiresAt,
  });

  res.json({
    message: 'Login successful',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const oldTokenString = req.body.refreshToken || req.cookies?.refreshToken;

  const result = await authService.refresh(oldTokenString);

  // Update refresh token cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: result.expiresAt,
  });

  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  await authService.logout(refreshToken);

  // Clear client cookies
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});
