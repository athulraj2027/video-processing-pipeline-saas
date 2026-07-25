import { bundleRepository } from '../repositories/bundle.repository.js';
import { CreateBundleDto, UpdateBundleDto } from '../schemas/bundle.schema.js';
import { ConflictError, NotFoundError } from '../errors/appError.js';

export class BundleService {
  private repo = bundleRepository;

  async createBundle(tenantId: string, data: CreateBundleDto) {
    const existing = await this.repo.getBundleBySlug(tenantId, data.slug);
    if (existing) {
      throw new ConflictError(`Bundle with slug '${data.slug}' already exists for this tenant`);
    }
    return this.repo.createBundle(tenantId, data);
  }

  async getBundleById(tenantId: string, id: string, userRole?: string) {
    const bundle = await this.repo.getBundleById(tenantId, id);
    if (!bundle) {
      throw new NotFoundError(`Bundle with ID '${id}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    if (!isAdmin && bundle.status !== 'published') {
      throw new NotFoundError(`Bundle with ID '${id}' not found`);
    }
    return bundle;
  }

  async getBundleBySlug(tenantId: string, slug: string, userRole?: string) {
    const bundle = await this.repo.getBundleBySlug(tenantId, slug);
    if (!bundle) {
      throw new NotFoundError(`Bundle with slug '${slug}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    if (!isAdmin && bundle.status !== 'published') {
      throw new NotFoundError(`Bundle with slug '${slug}' not found`);
    }
    return bundle;
  }

  async updateBundle(tenantId: string, id: string, data: UpdateBundleDto) {
    await this.getBundleById(tenantId, id, 'tenant_admin');

    if (data.slug) {
      const existing = await this.repo.getBundleBySlug(tenantId, data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Bundle with slug '${data.slug}' already exists`);
      }
    }

    return this.repo.updateBundle(tenantId, id, data);
  }

  async deleteBundle(tenantId: string, id: string) {
    await this.getBundleById(tenantId, id, 'tenant_admin');
    return this.repo.deleteBundle(tenantId, id);
  }

  async listBundles(tenantId: string, userRole?: string) {
    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    return this.repo.listBundles(tenantId, isAdmin ? undefined : 'published');
  }
}

export const bundleService = new BundleService();
export default bundleService;
