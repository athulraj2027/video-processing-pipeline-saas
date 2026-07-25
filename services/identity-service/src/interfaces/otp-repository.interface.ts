import type { Otp } from './otp.interface.js';

export interface IOtpRepository {
  createOrUpdateOtp(otp: Omit<Otp, 'id' | 'createdAt'>): Promise<Otp>;
  getOtpByEmailAndType(email: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<Otp | null>;
  deleteOtpByEmailAndType(email: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<void>;
}
