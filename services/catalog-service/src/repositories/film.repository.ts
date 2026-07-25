import { prisma } from '../config/db.js';

export class FilmRepository {
  async createFilm(tenantId: string, data: any) {
    const { genres, ...filmData } = data;

    // Ensure tenant exists in tenant mapping table (minimal entry)
    await prisma.tenant.upsert({
      where: { id: tenantId },
      create: { id: tenantId },
      update: {},
    });

    return prisma.film.create({
      data: {
        ...filmData,
        tenantId,
        pricing: {
          create: {}, // empty pricing defaults
        },
        availability: {
          create: {}, // empty availability defaults
        },
        ...(genres && genres.length > 0 && {
          filmGenres: {
            create: genres.map((genreId: string) => ({
              genre: { connect: { id: genreId } },
            })),
          },
        }),
      },
      include: {
        pricing: true,
        availability: true,
        filmGenres: {
          include: { genre: true },
        },
      },
    });
  }

  async getFilmById(tenantId: string, id: string) {
    return prisma.film.findFirst({
      where: { id, tenantId },
      include: {
        pricing: true,
        availability: true,
        assets: true,
        subtitles: true,
        chapters: true,
        variants: true,
        filmGenres: {
          include: { genre: true },
        },
      },
    });
  }

  async getFilmBySlug(tenantId: string, slug: string) {
    return prisma.film.findUnique({
      where: {
        tenantId_slug: { tenantId, slug: slug.toLowerCase() },
      },
      include: {
        pricing: true,
        availability: true,
        assets: true,
        subtitles: true,
        chapters: true,
        variants: true,
        filmGenres: {
          include: { genre: true },
        },
      },
    });
  }

  async updateFilm(tenantId: string, id: string, data: any) {
    const { genres, ...filmData } = data;

    // If genres are provided, sync them
    if (genres !== undefined) {
      // Clear current associations first
      await prisma.filmGenre.deleteMany({
        where: { filmId: id },
      });
    }

    return prisma.film.update({
      where: { id },
      data: {
        ...filmData,
        ...(genres !== undefined && {
          filmGenres: {
            create: genres.map((genreId: string) => ({
              genre: { connect: { id: genreId } },
            })),
          },
        }),
      },
      include: {
        pricing: true,
        availability: true,
        filmGenres: {
          include: { genre: true },
        },
      },
    });
  }

  async deleteFilm(tenantId: string, id: string) {
    return prisma.film.delete({
      where: { id },
    });
  }

  async listFilms(
    tenantId: string,
    filters: {
      status?: any;
      visibility?: any;
      contentType?: any;
      genreSlug?: string;
      search?: string;
    } = {}
  ) {
    const where: any = { tenantId };

    if (filters.status) where.status = filters.status;
    if (filters.visibility) where.visibility = filters.visibility;
    if (filters.contentType) where.contentType = filters.contentType;

    if (filters.genreSlug) {
      where.filmGenres = {
        some: {
          genre: {
            slug: filters.genreSlug.toLowerCase(),
          },
        },
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.film.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pricing: true,
        availability: true,
        filmGenres: {
          include: { genre: true },
        },
      },
    });
  }

  // Pricing
  async updatePricing(filmId: string, pricingData: any) {
    return prisma.filmPricing.upsert({
      where: { filmId },
      create: { ...pricingData, filmId },
      update: pricingData,
    });
  }

  // Availability
  async updateAvailability(filmId: string, availabilityData: any) {
    return prisma.filmAvailability.upsert({
      where: { filmId },
      create: { ...availabilityData, filmId },
      update: availabilityData,
    });
  }

  // Assets
  async addAsset(filmId: string, data: any) {
    return prisma.filmAsset.create({
      data: { ...data, filmId },
    });
  }

  async updateAsset(id: string, data: any) {
    return prisma.filmAsset.update({
      where: { id },
      data,
    });
  }

  async deleteAsset(id: string) {
    return prisma.filmAsset.delete({
      where: { id },
    });
  }

  async getAssetById(id: string) {
    return prisma.filmAsset.findUnique({
      where: { id },
    });
  }

  // Subtitles
  async addSubtitle(filmId: string, data: any) {
    return prisma.filmSubtitle.create({
      data: { ...data, filmId },
    });
  }

  async updateSubtitle(id: string, data: any) {
    return prisma.filmSubtitle.update({
      where: { id },
      data,
    });
  }

  async deleteSubtitle(id: string) {
    return prisma.filmSubtitle.delete({
      where: { id },
    });
  }

  async getSubtitleById(id: string) {
    return prisma.filmSubtitle.findUnique({
      where: { id },
    });
  }

  // Chapters
  async addChapter(filmId: string, data: any) {
    return prisma.filmChapter.create({
      data: { ...data, filmId },
    });
  }

  async updateChapter(id: string, data: any) {
    return prisma.filmChapter.update({
      where: { id },
      data,
    });
  }

  async deleteChapter(id: string) {
    return prisma.filmChapter.delete({
      where: { id },
    });
  }

  async getChapterById(id: string) {
    return prisma.filmChapter.findUnique({
      where: { id },
    });
  }

  // Variants
  async addVariant(filmId: string, data: any) {
    return prisma.filmVariant.create({
      data: { ...data, filmId },
    });
  }

  async updateVariant(id: string, data: any) {
    return prisma.filmVariant.update({
      where: { id },
      data,
    });
  }

  async deleteVariant(id: string) {
    return prisma.filmVariant.delete({
      where: { id },
    });
  }

  async getVariantById(id: string) {
    return prisma.filmVariant.findUnique({
      where: { id },
    });
  }
}

export const filmRepository = new FilmRepository();
export default filmRepository;
