import { userRepository } from '../repositories/user.repository.js';
import { tenantRepository } from '../repositories/tenant.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError } from '../errors/appError.js';

export class UserService {
  private repo = userRepository;
  private tenantRepo = tenantRepository;
  private auditRepo = auditRepository;

  async addTenantUser(tenantId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SUPPORT' | 'ANALYST' | 'VIEWER') {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }

    // Verify user profile exists in public user identity registry
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundError(`User '${userId}' does not exist in identity registry`);
    }

    const existingUserMapping = await this.repo.getTenantUser(tenantId, userId);
    if (existingUserMapping) {
      throw new ConflictError(`User '${userId}' already has membership in this tenant`);
    }

    const member = await this.repo.addTenantUser(tenantId, userId, role);

    await this.auditRepo.createAuditLog({
      tenantId,
      action: 'USER_ADD',
      entityType: 'TenantUser',
      entityId: member.id,
      after: member,
    });

    return member;
  }

  async updateTenantUserRole(tenantId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SUPPORT' | 'ANALYST' | 'VIEWER') {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }

    const existing = await this.repo.getTenantUser(tenantId, userId);
    if (!existing) {
      throw new NotFoundError(`Membership not found for user '${userId}' in tenant '${tenantId}'`);
    }

    const updated = await this.repo.updateTenantUserRole(tenantId, userId, role);

    await this.auditRepo.createAuditLog({
      tenantId,
      action: 'USER_ROLE_UPDATE',
      entityType: 'TenantUser',
      entityId: updated.id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async removeTenantUser(tenantId: string, userId: string) {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }

    const existing = await this.repo.getTenantUser(tenantId, userId);
    if (!existing) {
      throw new NotFoundError(`Membership not found for user '${userId}' in tenant '${tenantId}'`);
    }

    await this.repo.removeTenantUser(tenantId, userId);

    await this.auditRepo.createAuditLog({
      tenantId,
      action: 'USER_REMOVE',
      entityType: 'TenantUser',
      entityId: existing.id,
    });
  }

  async listTenantUsers(tenantId: string) {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }
    return this.repo.listTenantUsers(tenantId);
  }
}

export const userService = new UserService();
export default userService;
