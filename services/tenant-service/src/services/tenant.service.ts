import { tenantRepository, CreateTenantInput } from '../repositories/tenant.repository.js';
import { domainRepository } from '../repositories/domain.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/appError.js';

export class TenantService {
  private repo = tenantRepository;
  private domainRepo = domainRepository;
  private auditRepo = auditRepository;

  async createTenant(data: CreateTenantInput) {
    const slugLower = data.slug.toLowerCase();

    const existingSlug = await this.repo.getTenantBySlug(slugLower);
    if (existingSlug) {
      throw new ConflictError(`Tenant with slug '${data.slug}' already exists`);
    }

    if (data.primarySubdomain) {
      const subLower = data.primarySubdomain.toLowerCase();
      const existingSub = await this.repo.getTenantBySubdomain(subLower);
      if (existingSub) {
        throw new ConflictError(`Tenant with subdomain '${data.primarySubdomain}' already exists`);
      }
    }

    if (data.customDomain) {
      const domLower = data.customDomain.toLowerCase();
      const existingDom = await this.repo.getTenantByCustomDomain(domLower);
      if (existingDom) {
        throw new ConflictError(`Tenant with custom domain '${data.customDomain}' already exists`);
      }
    }

    const status = data.status || 'ONBOARDING';
    const planType = data.planType || 'STARTER';
    const billingStatus = data.billingStatus || 'TRIALING';

    const branding = {
      logoUrl: data.branding?.logoUrl || null,
      faviconUrl: data.branding?.faviconUrl || null,
      primaryColor: data.branding?.primaryColor || '#3b82f6',
      secondaryColor: data.branding?.secondaryColor || '#1d4ed8',
      backgroundColor: data.branding?.backgroundColor || '#111827',
      playerSkin: data.branding?.playerSkin || 'default',
      customCss: data.branding?.customCss || null,
    };

    const settings = {
      stripeCustomerId: data.stripeCustomerId || null,
      stripeConnectAcctId: data.stripeConnectAcctId || null,
      billingEmail: data.billingEmail || data.supportEmail || null,
      supportEmail: data.supportEmail || null,
      ...(data.settings || {}),
    };

    const limits = {
      maxStorageBytes: data.limits?.maxStorageBytes || 53687091200,
      maxBandwidthBytes: data.limits?.maxBandwidthBytes || 107374182400,
      maxUsers: data.limits?.maxUsers || 5,
      ...(data.limits || {}),
    };

    const features = {
      drmEnabled: data.features?.drmEnabled || false,
      geoRestrictionsEnabled: data.features?.geoRestrictionsEnabled || false,
      subtitlesEnabled: data.features?.subtitlesEnabled || true,
      ...(data.features || {}),
    };

    const tenant = await this.repo.createTenant({
      ...data,
      slug: slugLower,
      primarySubdomain: data.primarySubdomain?.toLowerCase(),
      primaryDomain: data.primaryDomain?.toLowerCase(),
      customDomain: data.customDomain?.toLowerCase(),
      status,
      planType,
      billingStatus,
      branding,
      settings,
      limits,
      features,
    });

    if (tenant.primarySubdomain) {
      await this.domainRepo.addDomain(tenant.id, `${tenant.primarySubdomain}.localhost`, 'SUBDOMAIN');
      await this.domainRepo.addDomain(tenant.id, `${tenant.primarySubdomain}.localhost:3000`, 'SUBDOMAIN');
    }

    // Automatically assign creator user as OWNER of the new tenant
    if (data.createdById) {
      try {
        // Ensure user exists in local replica table before creating TenantUser relation
        const localUserExists = await prisma.user.findUnique({ where: { id: data.createdById } });
        if (!localUserExists) {
          // If for some reason the sync was delayed, insert user replica now
          // Fetching user details would require identity endpoint, or we can use default values
          await prisma.user.create({
            data: {
              id: data.createdById,
              email: data.supportEmail || `${tenant.slug}@unresolved-email.local`,
            }
          });
        }

        await prisma.tenantUser.create({
          data: {
            tenantId: tenant.id,
            userId: data.createdById,
            role: 'OWNER',
            status: 'active',
          },
        });

        // Call identity-service to assign user's tenant context
        const patchResponse = await fetch(`http://localhost:4001/api/v1/auth/users/${data.createdById}/tenant`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId: tenant.id,
          }),
        });

        if (!patchResponse.ok) {
          console.error(`❌ Identity service user-tenant link update failed: ${patchResponse.status}`);
        }
      } catch (err) {
        console.error('❌ Failed to establish user-tenant mapping links:', err);
      }
    }

    await this.auditRepo.createAuditLog({
      tenantId: tenant.id,
      actorUserId: data.createdById,
      action: 'TENANT_CREATE',
      entityType: 'Tenant',
      entityId: tenant.id,
      after: tenant,
    });

    return tenant;
  }

  async getTenantById(id: string) {
    const tenant = await this.repo.getTenantById(id);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID '${id}' not found`);
    }
    return tenant;
  }

  async updateTenant(id: string, data: any) {
    const tenant = await this.getTenantById(id);
    const before = { ...tenant };

    if (data.slug && data.slug.toLowerCase() !== tenant.slug) {
      const existing = await this.repo.getTenantBySlug(data.slug.toLowerCase());
      if (existing) {
        throw new ConflictError(`Tenant with slug '${data.slug}' already exists`);
      }
      data.slug = data.slug.toLowerCase();
    }

    if (data.primarySubdomain && data.primarySubdomain.toLowerCase() !== tenant.primarySubdomain) {
      const existing = await this.repo.getTenantBySubdomain(data.primarySubdomain.toLowerCase());
      if (existing) {
        throw new ConflictError(`Tenant with subdomain '${data.primarySubdomain}' already exists`);
      }
      data.primarySubdomain = data.primarySubdomain.toLowerCase();
    }

    if (data.customDomain && data.customDomain.toLowerCase() !== tenant.customDomain) {
      const existing = await this.repo.getTenantByCustomDomain(data.customDomain.toLowerCase());
      if (existing) {
        throw new ConflictError(`Tenant with custom domain '${data.customDomain}' already exists`);
      }
      data.customDomain = data.customDomain.toLowerCase();
    }

    const updated = await this.repo.updateTenant(id, data);

    await this.auditRepo.createAuditLog({
      tenantId: id,
      action: 'TENANT_UPDATE',
      entityType: 'Tenant',
      entityId: id,
      before,
      after: updated,
    });

    return updated;
  }

  async updateBranding(id: string, brandingUpdates: any) {
    const tenant = await this.getTenantById(id);
    const updatedBranding = {
      ...(tenant.branding as any || {}),
      ...brandingUpdates,
    };
    return this.updateTenant(id, { branding: updatedBranding });
  }

  async updateSettings(id: string, settingsUpdates: any) {
    const tenant = await this.getTenantById(id);
    const updatedSettings = {
      ...(tenant.settings as any || {}),
      ...settingsUpdates,
    };
    return this.updateTenant(id, { settings: updatedSettings });
  }

  async updateLimits(id: string, limitsUpdates: any) {
    const tenant = await this.getTenantById(id);
    const updatedLimits = {
      ...(tenant.limits as any || {}),
      ...limitsUpdates,
    };
    return this.updateTenant(id, { limits: updatedLimits });
  }

  async updateFeatures(id: string, featuresUpdates: any) {
    const tenant = await this.getTenantById(id);
    const updatedFeatures = {
      ...(tenant.features as any || {}),
      ...featuresUpdates,
    };
    return this.updateTenant(id, { features: updatedFeatures });
  }

  async updateStatus(id: string, status: 'ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED') {
    const data: any = { status };

    if (status === 'ACTIVE') {
      data.activatedAt = new Date();
    } else if (status === 'SUSPENDED') {
      data.suspendedAt = new Date();
    } else if (status === 'DELETED') {
      data.deletedAt = new Date();
    }

    return this.updateTenant(id, data);
  }

  async deleteTenant(id: string) {
    await this.getTenantById(id);
    return this.repo.deleteTenant(id);
  }

  async listTenants() {
    return this.repo.listTenants();
  }

  async resolveTenantByHost(host: string) {
    if (!host) {
      throw new BadRequestError('Host query parameter is required');
    }

    const cleanHost = host.trim().toLowerCase();
    const hostWithoutPort = cleanHost.includes(':') ? cleanHost.split(':')[0] : cleanHost;

    let tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { customDomain: cleanHost },
          { customDomain: hostWithoutPort },
          { primaryDomain: cleanHost },
          { primaryDomain: hostWithoutPort },
          { primarySubdomain: cleanHost },
          { primarySubdomain: hostWithoutPort },
          { slug: cleanHost },
          { slug: hostWithoutPort },
        ],
      },
    });

    if (!tenant) {
      const domainRecord = await prisma.tenantDomain.findFirst({
        where: {
          OR: [
            { host: cleanHost },
            { host: hostWithoutPort },
          ],
        },
        include: {
          tenant: true,
        },
      });
      if (domainRecord) {
        tenant = domainRecord.tenant;
      }
    }

    if (!tenant) {
      const parts = hostWithoutPort.split('.');
      if (parts.length > 1) {
        const prefix = parts[0];
        tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              { primarySubdomain: prefix },
              { slug: prefix },
            ],
          },
        });

        if (!tenant) {
          const domainRecord = await prisma.tenantDomain.findFirst({
            where: { host: prefix },
            include: { tenant: true },
          });
          if (domainRecord) {
            tenant = domainRecord.tenant;
          }
        }
      }
    }

    if (!tenant) {
      throw new NotFoundError(`Tenant not found for host: ${host}`);
    }

    return tenant;
  }
}

export const tenantService = new TenantService();
export default tenantService;
