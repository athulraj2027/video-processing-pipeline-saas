import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import userRepository, { IUserRepository } from '../repositories/user.repository.js';
import refreshTokenRepository, { IRefreshTokenRepository } from '../repositories/refresh-token.repository.js';

import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/appError.js';
import { parseDuration } from '../utils/parseDuration.js';

export class AuthService {
  private userRepo: IUserRepository;
  private tokenRepo: IRefreshTokenRepository;

  constructor(userRepo = userRepository, tokenRepo = refreshTokenRepository) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
  }

  async signup(data: { email: string; passwordHash: string; role: string; tenantId?: string }) {
    const existingUser = await this.userRepo.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await bcryptjs.hash(data.passwordHash, 10);

    const userId = crypto.randomUUID();
    const newUser = await this.userRepo.createUser({
      id: userId,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role,
      tenantId: data.tenantId,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
      createdAt: newUser.createdAt,
    };
  }

  async login(data: { email: string; passwordHash: string }) {
    // Retrieve user
    const user = await this.userRepo.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await bcryptjs.compare(data.passwordHash, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT access token
    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      tenantId: user.tenantId,
    };
    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

    // Generate secure refresh token
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const refreshExpiresMs = parseDuration(env.REFRESH_TOKEN_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshExpiresMs);

    await this.tokenRepo.createRefreshToken({
      id: crypto.randomUUID(),
      userId: user.id,
      token: refreshTokenString,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async refresh(oldTokenString: string) {
    // Lookup token in database
    const storedToken = await this.tokenRepo.getRefreshToken(oldTokenString);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
      await this.tokenRepo.deleteRefreshToken(oldTokenString);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Fetch user
    const user = await this.userRepo.getUserById(storedToken.userId);
    if (!user) {
      await this.tokenRepo.deleteRefreshToken(oldTokenString);
      throw new UnauthorizedError('User associated with token not found');
    }

    // Generate new Access Token
    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      tenantId: user.tenantId,
    };
    const newAccessToken = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

    // Rotate refresh token
    const newRefreshTokenString = crypto.randomBytes(40).toString('hex');
    const refreshExpiresMs = parseDuration(env.REFRESH_TOKEN_EXPIRES_IN);
    const newExpiresAt = new Date(Date.now() + refreshExpiresMs);

    // Delete old token and insert new one
    await this.tokenRepo.deleteRefreshToken(oldTokenString);
    await this.tokenRepo.createRefreshToken({
      id: crypto.randomUUID(),
      userId: user.id,
      token: newRefreshTokenString,
      expiresAt: newExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
      expiresAt: newExpiresAt,
    };
  }

  async logout(refreshTokenString: string) {
    // Delete refresh token from DB
    await this.tokenRepo.deleteRefreshToken(refreshTokenString);
  }

  async getUserById(id: string) {
    const user = await this.userRepo.getUserById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
export default authService;
