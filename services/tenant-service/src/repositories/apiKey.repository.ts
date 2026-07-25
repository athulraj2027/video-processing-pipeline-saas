import { prisma } from '../config/db.js';

export interface CreateApiKeyInput {
  tenantId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  expiresAt?: Date;
}

export class ApiKeyRepository {
  async createApiKey(data: CreateApiKeyInput) {
    return prisma.tenantApiKey.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        keyPrefix: data.keyPrefix,
        keyHash: data.keyHash,
        scopes: data.scopes,
        expiresAt: data.expiresAt || null,
      },
    });
  }

  async getApiKeyByPrefix(keyPrefix: string) {
    return prisma.tenantApiKey.findUnique({
      where: { keyPrefix },
      include: { tenant: true },
    });
  }

  async getApiKeyById(id: string) {
    return prisma.tenantApiKey.findUnique({
      where: { id },
    });
  }

  async listApiKeys(tenantId: string) {
    return prisma.tenantApiKey.findMany({
      where: {
        tenantId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLastUsed(id: string) {
    return prisma.tenantApiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async revokeApiKey(id: string) {
    return prisma.tenantApiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

export const apiKeyRepository = new ApiKeyRepository();
export default apiKeyRepository;
