import { prisma } from '../config/db.js';

export class AuditRepository {
  async createAuditLog(data: {
    tenantId?: string;
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    before?: any;
    after?: any;
  }) {
    return prisma.tenantAuditLog.create({
      data,
    });
  }
}

export const auditRepository = new AuditRepository();
export default auditRepository;
