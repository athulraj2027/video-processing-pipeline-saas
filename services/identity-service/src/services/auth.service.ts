import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import userRepository from '../repositories/user.repository.js';
import refreshTokenRepository from '../repositories/refresh-token.repository.js';
import otpRepository from '../repositories/otp.repository.js';
import emailService from './email.service.js';
import type { User, IUserRepository, IRefreshTokenRepository, IOtpRepository } from '../interfaces/index.js';

import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/appError.js';
import { parseDuration } from '../utils/parseDuration.js';

export class AuthService {
  private userRepo: IUserRepository;
  private tokenRepo: IRefreshTokenRepository;
  private otpRepo: IOtpRepository;
  private emailService: any;

  constructor(
    userRepo = userRepository,
    tokenRepo = refreshTokenRepository,
    otpRepo = otpRepository,
    emailSvc = emailService
  ) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
    this.otpRepo = otpRepo;
    this.emailService = emailSvc;
  }

  async signup(data: { email: string; passwordHash: string; role: string; tenantId?: string }) {
    // Check if user already exists in users table
    const existingUser = await this.userRepo.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Hash password immediately
    const hashedPassword = await bcryptjs.hash(data.passwordHash, 10);

    // Generate 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Save pending registration and verification code in Otp table
    await this.otpRepo.createOrUpdateOtp({
      email: data.email,
      otp: otpCode,
      passwordHash: hashedPassword,
      role: data.role,
      tenantId: data.tenantId,
      expiresAt,
    });

    // Send the verification email (Mock console logger)
    await this.emailService.sendVerificationOtp(data.email, otpCode);

    return {
      email: data.email.toLowerCase(),
      // Return code in test/dev environments so integration test runs can fetch it
      ...(env.NODE_ENV !== 'production' && { _testOtp: otpCode }),
    };
  }

  private async generateTokensForUser(user: User) {
    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      tenantId: user.tenantId,
    };
    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

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

  async verifyEmail(data: { email: string; otp: string }) {
    // Look up OTP code record
    const otpRecord = await this.otpRepo.getOtpByEmail(data.email);
    if (!otpRecord) {
      throw new NotFoundError('Verification code not found or expired');
    }

    // Validate expiration
    if (otpRecord.expiresAt < new Date()) {
      await this.otpRepo.deleteOtpByEmail(data.email);
      throw new UnauthorizedError('Verification code has expired');
    }

    // Match code
    if (otpRecord.otp !== data.otp) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // Create the permanent user profile
    const userId = crypto.randomUUID();
    const newUser = await this.userRepo.createUser({
      id: userId,
      email: otpRecord.email,
      passwordHash: otpRecord.passwordHash,
      role: otpRecord.role,
      tenantId: otpRecord.tenantId,
    });

    // Clear verification session
    await this.otpRepo.deleteOtpByEmail(data.email);

    // Auto-login upon successful verification
    return this.generateTokensForUser(newUser);
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

    return this.generateTokensForUser(user);
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

    // Delete old token
    await this.tokenRepo.deleteRefreshToken(oldTokenString);

    // Generate new tokens
    return this.generateTokensForUser(user);
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
