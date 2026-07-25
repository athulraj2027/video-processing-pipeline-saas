import { prisma } from '../config/db.js';
import { CreateRatingDto, UpdateRatingDto } from '../schemas/rating.schema.js';

export class RatingRepository {
  async addOrUpdateRating(tenantId: string, viewerUserId: string, data: CreateRatingDto) {
    return prisma.filmRating.upsert({
      where: {
        tenantId_viewerUserId_filmId: {
          tenantId,
          viewerUserId,
          filmId: data.filmId,
        },
      },
      create: {
        tenantId,
        viewerUserId,
        filmId: data.filmId,
        rating: data.rating,
        reviewTitle: data.reviewTitle ?? null,
        reviewBody: data.reviewBody ?? null,
        isPublished: data.isPublished ?? false,
      },
      update: {
        rating: data.rating,
        reviewTitle: data.reviewTitle ?? null,
        reviewBody: data.reviewBody ?? null,
        isPublished: data.isPublished ?? false,
      },
    });
  }

  async getRatingById(tenantId: string, id: string) {
    return prisma.filmRating.findFirst({
      where: { id, tenantId },
    });
  }

  async getRatingByViewer(tenantId: string, viewerUserId: string, filmId: string) {
    return prisma.filmRating.findUnique({
      where: {
        tenantId_viewerUserId_filmId: {
          tenantId,
          viewerUserId,
          filmId,
        },
      },
    });
  }

  async updateRating(tenantId: string, id: string, data: UpdateRatingDto) {
    return prisma.filmRating.update({
      where: { id },
      data,
    });
  }

  async deleteRating(tenantId: string, id: string) {
    return prisma.filmRating.delete({
      where: { id },
    });
  }

  async listRatingsForFilm(tenantId: string, filmId: string, isPublishedOnly = true) {
    return prisma.filmRating.findMany({
      where: {
        tenantId,
        filmId,
        ...(isPublishedOnly && { isPublished: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllRatingsForTenant(tenantId: string) {
    return prisma.filmRating.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const ratingRepository = new RatingRepository();
export default ratingRepository;
