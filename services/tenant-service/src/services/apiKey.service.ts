import crypto from 'crypto';
import { apiKeyRepository } from '../repositories/apiKey.repository.js';
import { tenantRepository } from '../repositories/tenant.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { ConflictError, NotFoundError, BadRequestError, UnauthorizedError } from '../errors/appError.js';

export class ApiKeyService {
  private repo = apiKeyRepository;
  private tenantRepo = tenantRepository;
  private auditRepo = auditRepository;

  async createApiKey(tenantId: string, name: string, scopes: string[], expiresAt?: Date) {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }

    // Generate prefix and secret
    const prefix = `tk_${crypto.randomBytes(6).toString('hex')}`; // e.g. tk_a1b2c3d4e5f6
    const secret = crypto.randomBytes(24).toString('hex');
    const rawKey = `${prefix}.${secret}`;

    // Hash the full key
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.repo.createApiKey({
      tenantId,
      name,
      keyPrefix: prefix,
      keyHash,
      scopes: scopes || ['*'],
      expiresAt,
    });

    await this.auditRepo.createAuditLog({
      tenantId,
      action: 'API_KEY_CREATE',
      entityType: 'TenantApiKey',
      entityId: apiKey.id,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      rawKey, // Returned ONLY ONCE on creation
    };
  }

  async listApiKeys(tenantId: string) {
    const tenant = await this.tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${tenantId}' not found`);
    }
    return this.repo.listApiKeys(tenantId);
  }

  async revokeApiKey(tenantId: string, keyId: string) {
    const key = await this.repo.getApiKeyById(keyId);
    if (!key || key.tenantId !== tenantId) {
      throw new NotFoundError(`API Key '${keyId}' not found in this tenant`);
    }

    const revoked = await this.repo.revokeApiKey(keyId);

    await this.auditRepo.createAuditLog({
      tenantId,
      action: 'API_KEY_REVOKE',
      entityType: 'TenantApiKey',
      entityId: keyId,
    });

    return revoked;
  }

  async verifyApiKey(rawKey: string) {
    if (!rawKey || !rawKey.includes('.')) {
      throw new UnauthorizedError('Invalid API key structure');
    }

    const [prefix] = rawKey.split('.');
    const keyRecord = await this.repo.getApiKeyByPrefix(prefix);
    
    if (!keyRecord || keyRecord.revokedAt) {
      throw new UnauthorizedError('API Key is invalid or has been revoked');
    }

    // Validate expiration
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('API Key has expired');
    }

    // Verify hash match
    const inputHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    if (keyRecord.keyHash !== inputHash) {
      throw new UnauthorizedError('Invalid API key secret');
    }

    // Update lastUsedAt timestamp asynchronously
    await this.repo.updateLastUsed(keyRecord.id).catch(console.error);

    return keyRecord;
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
