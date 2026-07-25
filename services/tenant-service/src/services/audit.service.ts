import { auditRepository } from '../repositories/audit.repository.js';
import { tenantRepository } from '../repositories/tenant.repository.js';
import { prisma } from '../config/db.js';
import { NotFoundError } from '../errors/appError.js';

export class AuditService {
  private repo = auditRepository;
  private tenantRepo = tenantRepository;

  async listAuditLogs(tenantId: string) {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }

    return prisma.tenantAuditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const auditService = new AuditService();
export default auditService;
