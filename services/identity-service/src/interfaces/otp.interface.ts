export interface Otp {
  id: string;
  email: string;
  otp: string;
  type: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
  passwordHash?: string;
  role?: string;
  tenantId?: string;
  expiresAt: Date;
  createdAt: Date;
}
