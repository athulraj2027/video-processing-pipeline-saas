import { prisma } from '../config/db.js';
import { CreateGenreDto, UpdateGenreDto } from '../schemas/genre.schema.js';

export class GenreRepository {
  async createGenre(tenantId: string, data: CreateGenreDto) {
    return prisma.genre.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug.toLowerCase(),
        description: data.description ?? null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        metadata: data.metadata ?? {},
      },
    });
  }

  async getGenreById(tenantId: string, id: string) {
    return prisma.genre.findFirst({
      where: { id, tenantId },
    });
  }

  async getGenreBySlug(tenantId: string, slug: string) {
    return prisma.genre.findUnique({
      where: {
        tenantId_slug: { tenantId, slug: slug.toLowerCase() },
      },
    });
  }

  async updateGenre(tenantId: string, id: string, data: UpdateGenreDto) {
    return prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug ? data.slug.toLowerCase() : undefined,
        description: data.description,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        metadata: data.metadata,
      },
    });
  }

  async deleteGenre(tenantId: string, id: string) {
    return prisma.genre.delete({
      where: { id },
    });
  }

  async listGenres(tenantId: string, isActiveOnly = false) {
    return prisma.genre.findMany({
      where: {
        tenantId,
        ...(isActiveOnly && { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

export const genreRepository = new GenreRepository();
export default genreRepository;
