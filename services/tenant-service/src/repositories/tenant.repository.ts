import { prisma } from '../config/db.js';

export interface CreateTenantInput {
  name: string;
  slug: string;
  subdomain?: string;
  customDomain?: string;
  status?: string;
  branding?: any;
  settings?: any;
}

export class TenantRepository {
  async createTenant(data: CreateTenantInput) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        subdomain: data.subdomain || null,
        customDomain: data.customDomain || null,
        status: data.status || 'active',
        branding: data.branding || {},
        settings: data.settings || {},
      },
    });
  }

  async getTenantById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
    });
  }

  async getTenantBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async getTenantBySubdomain(subdomain: string) {
    return prisma.tenant.findUnique({
      where: { subdomain },
    });
  }

  async getTenantByCustomDomain(customDomain: string) {
    return prisma.tenant.findUnique({
      where: { customDomain },
    });
  }

  async updateTenant(id: string, data: any) {
    return prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async deleteTenant(id: string) {
    return prisma.tenant.delete({
      where: { id },
    });
  }

  async listTenants() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const tenantRepository = new TenantRepository();
export default tenantRepository;
