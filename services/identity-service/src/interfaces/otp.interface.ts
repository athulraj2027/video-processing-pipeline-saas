export interface Otp {
  id: string;
  email: string;
  otp: string;
  passwordHash: string;
  role: string;
  tenantId?: string;
  expiresAt: Date;
  createdAt: Date;
}
