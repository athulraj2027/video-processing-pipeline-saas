import { prisma } from '../config/db.js';
import { CreateBundleDto, UpdateBundleDto } from '../schemas/bundle.schema.js';

export class BundleRepository {
  async createBundle(tenantId: string, data: CreateBundleDto) {
    const { filmIds, ...bundleData } = data;
    return prisma.bundle.create({
      data: {
        ...bundleData,
        tenantId,
        price: bundleData.price !== undefined ? bundleData.price : null,
        metadata: bundleData.metadata ?? {},
        items: {
          create: filmIds ? filmIds.map((filmId: string) => ({ filmId })) : [],
        },
      },
      include: {
        items: {
          include: { film: true },
        },
      },
    });
  }

  async getBundleById(tenantId: string, id: string) {
    return prisma.bundle.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: { film: true },
        },
      },
    });
  }

  async getBundleBySlug(tenantId: string, slug: string) {
    return prisma.bundle.findUnique({
      where: {
        tenantId_slug: { tenantId, slug: slug.toLowerCase() },
      },
      include: {
        items: {
          include: { film: true },
        },
      },
    });
  }

  async updateBundle(tenantId: string, id: string, data: UpdateBundleDto) {
    const { filmIds, ...bundleData } = data;

    if (filmIds !== undefined) {
      await prisma.filmBundleItem.deleteMany({
        where: { bundleId: id },
      });
    }

    return prisma.bundle.update({
      where: { id },
      data: {
        ...bundleData,
        ...(filmIds !== undefined && {
          items: {
            create: filmIds.map((filmId: string) => ({ filmId })),
          },
        }),
      },
      include: {
        items: {
          include: { film: true },
        },
      },
    });
  }

  async deleteBundle(tenantId: string, id: string) {
    return prisma.bundle.delete({
      where: { id },
    });
  }

  async listBundles(tenantId: string, status?: string) {
    return prisma.bundle.findMany({
      where: {
        tenantId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { film: true },
        },
      },
    });
  }
}

export const bundleRepository = new BundleRepository();
export default bundleRepository;
