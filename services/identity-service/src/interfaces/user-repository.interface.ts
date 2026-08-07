import { User } from './user.interface.js';

export interface IUserRepository {
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateUserPassword(id: string, passwordHash: string): Promise<User>;
  updateUserTenant(id: string, tenantId: string): Promise<User>;
}
