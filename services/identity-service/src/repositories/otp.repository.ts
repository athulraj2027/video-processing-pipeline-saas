import { prisma } from '../config/db.js';
import type { Otp, IOtpRepository } from '../interfaces/index.js';

class PrismaOtpRepository implements IOtpRepository {
  async createOrUpdateOtp(otp: Omit<Otp, 'id' | 'createdAt'>): Promise<Otp> {
    const upserted = await prisma.otp.upsert({
      where: { email: otp.email.toLowerCase() },
      update: {
        otp: otp.otp,
        passwordHash: otp.passwordHash,
        role: otp.role,
        tenantId: otp.tenantId ?? null,
        expiresAt: otp.expiresAt,
      },
      create: {
        email: otp.email.toLowerCase(),
        otp: otp.otp,
        passwordHash: otp.passwordHash,
        role: otp.role,
        tenantId: otp.tenantId ?? null,
        expiresAt: otp.expiresAt,
      },
    });

    return {
      id: upserted.id,
      email: upserted.email,
      otp: upserted.otp,
      passwordHash: upserted.passwordHash,
      role: upserted.role,
      tenantId: upserted.tenantId ?? undefined,
      expiresAt: upserted.expiresAt,
      createdAt: upserted.createdAt,
    };
  }

  async getOtpByEmail(email: string): Promise<Otp | null> {
    const found = await prisma.otp.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!found) return null;

    return {
      id: found.id,
      email: found.email,
      otp: found.otp,
      passwordHash: found.passwordHash,
      role: found.role,
      tenantId: found.tenantId ?? undefined,
      expiresAt: found.expiresAt,
      createdAt: found.createdAt,
    };
  }

  async deleteOtpByEmail(email: string): Promise<void> {
    await prisma.otp.deleteMany({
      where: { email: email.toLowerCase() },
    });
  }
}

export const otpRepository: IOtpRepository = new PrismaOtpRepository();
export default otpRepository;
