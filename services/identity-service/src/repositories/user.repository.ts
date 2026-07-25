import { prisma } from '../config/db.js';
import type { User, IUserRepository } from '../interfaces/index.js';

class PrismaUserRepository implements IUserRepository {
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role,
        tenantId: user.tenantId ?? null,
      },
    });

    return {
      id: created.id,
      email: created.email,
      passwordHash: created.passwordHash,
      role: created.role,
      tenantId: created.tenantId ?? undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!found) return null;

    return {
      id: found.id,
      email: found.email,
      passwordHash: found.passwordHash,
      role: found.role,
      tenantId: found.tenantId ?? undefined,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const found = await prisma.user.findUnique({
      where: { id },
    });

    if (!found) return null;

    return {
      id: found.id,
      email: found.email,
      passwordHash: found.passwordHash,
      role: found.role,
      tenantId: found.tenantId ?? undefined,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    };
  }
}

export const userRepository: IUserRepository = new PrismaUserRepository();
export default userRepository;
