import { RefreshToken } from './refresh-token.interface.js';

export interface IRefreshTokenRepository {
  createRefreshToken(token: Omit<RefreshToken, 'createdAt'>): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
}
