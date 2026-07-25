import { prisma } from '../config/db.js';

export interface CreateTenantInput {
  name: string;
  slug: string;
  primarySubdomain?: string;
  primaryDomain?: string;
  customDomain?: string;
  status?: 'ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  planType?: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'CUSTOM';
  billingStatus?: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'PAUSED';
  branding?: any;
  settings?: any;
  limits?: any;
  features?: any;
  metadata?: any;
  stripeCustomerId?: string;
  stripeConnectAcctId?: string;
  billingEmail?: string;
  supportEmail?: string;
  trialEndsAt?: Date;
  createdById?: string;
}

export class TenantRepository {
  async createTenant(data: CreateTenantInput) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        status: data.status || 'ONBOARDING',
        planType: data.planType || 'STARTER',
        billingStatus: data.billingStatus || 'TRIALING',
        primarySubdomain: data.primarySubdomain || null,
        primaryDomain: data.primaryDomain || null,
        customDomain: data.customDomain || null,
        branding: data.branding || {},
        settings: data.settings || {},
        limits: data.limits || {},
        features: data.features || {},
        metadata: data.metadata || {},
        stripeCustomerId: data.stripeCustomerId || null,
        stripeConnectAcctId: data.stripeConnectAcctId || null,
        billingEmail: data.billingEmail || null,
        supportEmail: data.supportEmail || null,
        trialEndsAt: data.trialEndsAt || null,
        createdById: data.createdById || null,
        activatedAt: data.status === 'ACTIVE' ? new Date() : null,
      },
    });
  }

  async getTenantById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        domains: true,
        users: true,
      },
    });
  }

  async getTenantBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async getTenantBySubdomain(subdomain: string) {
    return prisma.tenant.findUnique({
      where: { primarySubdomain: subdomain },
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
      include: {
        domains: true,
      },
    });
  }
}

export const tenantRepository = new TenantRepository();
export default tenantRepository;
