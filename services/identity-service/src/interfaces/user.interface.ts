export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}
