import { prisma } from '../config/db.js';
import type { Otp, IOtpRepository } from '../interfaces/index.js';

class PrismaOtpRepository implements IOtpRepository {
  async createOrUpdateOtp(otp: Omit<Otp, 'id' | 'createdAt'>): Promise<Otp> {
    const upserted = await prisma.otp.upsert({
      where: {
        email_type: {
          email: otp.email.toLowerCase(),
          type: otp.type,
        },
      },
      update: {
        otp: otp.otp,
        passwordHash: otp.passwordHash ?? null,
        role: otp.role ?? null,
        tenantId: otp.tenantId ?? null,
        expiresAt: otp.expiresAt,
      },
      create: {
        email: otp.email.toLowerCase(),
        otp: otp.otp,
        type: otp.type,
        passwordHash: otp.passwordHash ?? null,
        role: otp.role ?? null,
        tenantId: otp.tenantId ?? null,
        expiresAt: otp.expiresAt,
      },
    });

    return {
      id: upserted.id,
      email: upserted.email,
      otp: upserted.otp,
      type: upserted.type,
      passwordHash: upserted.passwordHash ?? undefined,
      role: upserted.role ?? undefined,
      tenantId: upserted.tenantId ?? undefined,
      expiresAt: upserted.expiresAt,
      createdAt: upserted.createdAt,
    };
  }

  async getOtpByEmailAndType(email: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<Otp | null> {
    const found = await prisma.otp.findUnique({
      where: {
        email_type: {
          email: email.toLowerCase(),
          type,
        },
      },
    });

    if (!found) return null;

    return {
      id: found.id,
      email: found.email,
      otp: found.otp,
      type: found.type,
      passwordHash: found.passwordHash ?? undefined,
      role: found.role ?? undefined,
      tenantId: found.tenantId ?? undefined,
      expiresAt: found.expiresAt,
      createdAt: found.createdAt,
    };
  }

  async deleteOtpByEmailAndType(email: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<void> {
    await prisma.otp.deleteMany({
      where: {
        email: email.toLowerCase(),
        type,
      },
    });
  }
}

export const otpRepository: IOtpRepository = new PrismaOtpRepository();
export default otpRepository;
