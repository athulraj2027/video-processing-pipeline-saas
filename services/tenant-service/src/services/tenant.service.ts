import { tenantRepository, CreateTenantInput } from '../repositories/tenant.repository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/appError.js';

export class TenantService {
  private repo = tenantRepository;

  async createTenant(data: CreateTenantInput) {
    // Validate slug uniqueness
    const existingSlug = await this.repo.getTenantBySlug(data.slug.toLowerCase());
    if (existingSlug) {
      throw new ConflictError(`Tenant with slug '${data.slug}' already exists`);
    }

    // Validate subdomain uniqueness if provided
    if (data.subdomain) {
      const existingSub = await this.repo.getTenantBySubdomain(data.subdomain.toLowerCase());
      if (existingSub) {
        throw new ConflictError(`Tenant with subdomain '${data.subdomain}' already exists`);
      }
    }

    // Validate customDomain uniqueness if provided
    if (data.customDomain) {
      const existingDomain = await this.repo.getTenantByCustomDomain(data.customDomain.toLowerCase());
      if (existingDomain) {
        throw new ConflictError(`Tenant with custom domain '${data.customDomain}' already exists`);
      }
    }

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
      billingPlan: data.settings?.billingPlan || 'starter',
      maxStorageBytes: data.settings?.maxStorageBytes || 53687091200, // 50 GB
      maxBandwidthBytes: data.settings?.maxBandwidthBytes || 107374182400, // 100 GB
      stripeCustomerId: data.settings?.stripeCustomerId || null,
      stripeAccountId: data.settings?.stripeAccountId || null,
      features: {
        drmEnabled: data.settings?.features?.drmEnabled || false,
        geoRestrictionsEnabled: data.settings?.features?.geoRestrictionsEnabled || false,
        subtitlesEnabled: data.settings?.features?.subtitlesEnabled || true,
        ...(data.settings?.features || {}),
      },
    };

    return this.repo.createTenant({
      ...data,
      slug: data.slug.toLowerCase(),
      subdomain: data.subdomain?.toLowerCase(),
      customDomain: data.customDomain?.toLowerCase(),
      branding,
      settings,
    });
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

    // Validate slug uniqueness if updated
    if (data.slug && data.slug.toLowerCase() !== tenant.slug) {
      const existing = await this.repo.getTenantBySlug(data.slug.toLowerCase());
      if (existing) {
        throw new ConflictError(`Tenant with slug '${data.slug}' already exists`);
      }
      data.slug = data.slug.toLowerCase();
    }

    // Validate subdomain uniqueness if updated
    if (data.subdomain && data.subdomain.toLowerCase() !== tenant.subdomain) {
      const existing = await this.repo.getTenantBySubdomain(data.subdomain.toLowerCase());
      if (existing) {
        throw new ConflictError(`Tenant with subdomain '${data.subdomain}' already exists`);
      }
      data.subdomain = data.subdomain.toLowerCase();
    }

    // Validate customDomain uniqueness if updated
    if (data.customDomain && data.customDomain.toLowerCase() !== tenant.customDomain) {
      const existing = await this.repo.getTenantByCustomDomain(data.customDomain.toLowerCase());
      if (existing) {
        throw new ConflictError(`Tenant with custom domain '${data.customDomain}' already exists`);
      }
      data.customDomain = data.customDomain.toLowerCase();
    }

    return this.repo.updateTenant(id, data);
  }

  async updateBranding(id: string, brandingUpdates: any) {
    const tenant = await this.getTenantById(id);
    const existingBranding = (tenant.branding as any) || {};

    const updatedBranding = {
      ...existingBranding,
      ...brandingUpdates,
    };

    return this.repo.updateTenant(id, { branding: updatedBranding });
  }

  async updateSettings(id: string, settingsUpdates: any) {
    const tenant = await this.getTenantById(id);
    const existingSettings = (tenant.settings as any) || {};

    const updatedSettings = {
      ...existingSettings,
      ...settingsUpdates,
      features: {
        ...(existingSettings.features || {}),
        ...(settingsUpdates.features || {}),
      },
    };

    return this.repo.updateTenant(id, { settings: updatedSettings });
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['onboarding', 'active', 'suspended', 'deleted'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status '${status}'. Allowed values: ${validStatuses.join(', ')}`);
    }

    await this.getTenantById(id);
    return this.repo.updateTenant(id, { status });
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

    // 1. Match customDomain
    let tenant = await this.repo.getTenantByCustomDomain(cleanHost)
      || await this.repo.getTenantByCustomDomain(hostWithoutPort);

    // 2. Match subdomain
    if (!tenant) {
      tenant = await this.repo.getTenantBySubdomain(cleanHost)
        || await this.repo.getTenantBySubdomain(hostWithoutPort);
    }

    // 3. Match slug
    if (!tenant) {
      tenant = await this.repo.getTenantBySlug(cleanHost)
        || await this.repo.getTenantBySlug(hostWithoutPort);
    }

    // 4. Match subdomain/slug prefix (e.g. my-studio.localhost:3000 -> prefix "my-studio")
    if (!tenant) {
      const parts = hostWithoutPort.split('.');
      if (parts.length > 1) {
        const prefix = parts[0];
        tenant = await this.repo.getTenantBySubdomain(prefix)
          || await this.repo.getTenantBySlug(prefix);
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
