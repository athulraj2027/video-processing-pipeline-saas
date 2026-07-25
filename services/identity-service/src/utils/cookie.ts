import { Response } from 'express';
import { env } from '../config/env.js';

export function setRefreshTokenCookie(res: Response, refreshToken: string, expiresAt: Date): void {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
  });
}
