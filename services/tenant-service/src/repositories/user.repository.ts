import { prisma } from '../config/db.js';

export class UserRepository {
  async addTenantUser(tenantId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SUPPORT' | 'ANALYST' | 'VIEWER') {
    return prisma.tenantUser.create({
      data: {
        tenantId,
        userId,
        role,
        status: 'active',
      },
    });
  }

  async getTenantUser(tenantId: string, userId: string) {
    return prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: { tenantId, userId },
      },
    });
  }

  async updateTenantUserRole(tenantId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SUPPORT' | 'ANALYST' | 'VIEWER') {
    return prisma.tenantUser.update({
      where: {
        tenantId_userId: { tenantId, userId },
      },
      data: { role },
    });
  }

  async removeTenantUser(tenantId: string, userId: string) {
    return prisma.tenantUser.delete({
      where: {
        tenantId_userId: { tenantId, userId },
      },
    });
  }

  async listTenantUsers(tenantId: string) {
    return prisma.tenantUser.findMany({
      where: { tenantId },
    });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
