import { prisma } from '../config/db.js';

export class DomainRepository {
  async addDomain(tenantId: string, host: string, type: 'SUBDOMAIN' | 'CUSTOM_DOMAIN' | 'PRIMARY_DOMAIN') {
    return prisma.tenantDomain.create({
      data: {
        tenantId,
        host,
        type,
        status: 'PENDING',
        verificationToken: `verify_${Math.random().toString(36).substr(2, 9)}`,
      },
    });
  }

  async getDomain(host: string) {
    return prisma.tenantDomain.findUnique({
      where: { host },
      include: { tenant: true },
    });
  }

  async getDomainById(id: string) {
    return prisma.tenantDomain.findUnique({
      where: { id },
    });
  }

  async listDomains(tenantId: string) {
    return prisma.tenantDomain.findMany({
      where: { tenantId },
    });
  }

  async updateDomainStatus(domainId: string, status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'FAILED') {
    return prisma.tenantDomain.update({
      where: { id: domainId },
      data: {
        status,
        lastVerifiedAt: status === 'VERIFIED' || status === 'ACTIVE' ? new Date() : undefined,
      },
    });
  }

  async deleteDomain(domainId: string) {
    return prisma.tenantDomain.delete({
      where: { id: domainId },
    });
  }
}

export const domainRepository = new DomainRepository();
export default domainRepository;
