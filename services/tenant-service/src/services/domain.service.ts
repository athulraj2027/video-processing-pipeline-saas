import { domainRepository } from '../repositories/domain.repository.js';
import { tenantRepository } from '../repositories/tenant.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError } from '../errors/appError.js';

export class DomainService {
  private repo = domainRepository;
  private tenantRepo = tenantRepository;
  private auditRepo = auditRepository;

  async addDomain(tenantId: string, host: string, type: 'SUBDOMAIN' | 'CUSTOM_DOMAIN' | 'PRIMARY_DOMAIN') {
    // Ensure tenant exists
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }

    const cleanHost = host.toLowerCase().trim();

    // Check unique host
    const existing = await this.repo.getDomain(cleanHost);
    if (existing) {
      throw new ConflictError(`Domain host '${host}' is already mapped to another tenant`);
    }

    const domain = await this.repo.addDomain(tenantId, cleanHost, type);

    await this.auditRepo.createAuditLog({
      tenantId,
      action: 'DOMAIN_ADD',
      entityType: 'TenantDomain',
      entityId: domain.id,
      after: domain,
    });

    return domain;
  }

  async listDomains(tenantId: string) {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }
    return this.repo.listDomains(tenantId);
  }

  async verifyDomain(domainId: string) {
    const domainRecord = await this.repo.getDomainById(domainId);
    if (!domainRecord) {
      throw new NotFoundError(`Domain record '${domainId}' not found`);
    }

    const verified = await this.repo.updateDomainStatus(domainId, 'ACTIVE');

    await this.auditRepo.createAuditLog({
      tenantId: domainRecord.tenantId,
      action: 'DOMAIN_VERIFY',
      entityType: 'TenantDomain',
      entityId: domainId,
      after: verified,
    });

    return verified;
  }

  async deleteDomain(domainId: string) {
    const domainRecord = await this.repo.getDomainById(domainId);
    if (!domainRecord) {
      throw new NotFoundError(`Domain record '${domainId}' not found`);
    }

    await this.repo.deleteDomain(domainId);

    await this.auditRepo.createAuditLog({
      tenantId: domainRecord.tenantId,
      action: 'DOMAIN_DELETE',
      entityType: 'TenantDomain',
      entityId: domainId,
    });
  }
}

export const domainService = new DomainService();
export default domainService;
