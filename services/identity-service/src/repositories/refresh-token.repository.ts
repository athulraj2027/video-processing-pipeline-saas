import { prisma } from '../config/db.js';
import type { RefreshToken, IRefreshTokenRepository } from '../interfaces/index.js';

class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async createRefreshToken(token: Omit<RefreshToken, 'createdAt'>): Promise<RefreshToken> {
    const created = await prisma.refreshToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        token: token.token,
        expiresAt: token.expiresAt,
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      token: created.token,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
    };
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const found = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!found) return null;

    return {
      id: found.id,
      userId: found.userId,
      token: found.token,
      expiresAt: found.expiresAt,
      createdAt: found.createdAt,
    };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export const refreshTokenRepository: IRefreshTokenRepository = new PrismaRefreshTokenRepository();
export default refreshTokenRepository;
