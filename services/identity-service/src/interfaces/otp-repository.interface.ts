import type { Otp } from './otp.interface.js';

export interface IOtpRepository {
  createOrUpdateOtp(otp: Omit<Otp, 'id' | 'createdAt'>): Promise<Otp>;
  getOtpByEmail(email: string): Promise<Otp | null>;
  deleteOtpByEmail(email: string): Promise<void>;
}
