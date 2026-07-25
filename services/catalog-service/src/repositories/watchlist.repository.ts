import { prisma } from '../config/db.js';
import { CreateWatchlistItemDto } from '../schemas/watchlist.schema.js';

export class WatchlistRepository {
  async addToWatchlist(tenantId: string, viewerUserId: string, data: CreateWatchlistItemDto) {
    return prisma.watchlistItem.upsert({
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
        notes: data.notes ?? null,
      },
      update: {
        notes: data.notes ?? null,
      },
      include: {
        film: true,
      },
    });
  }

  async getWatchlistItem(tenantId: string, viewerUserId: string, filmId: string) {
    return prisma.watchlistItem.findUnique({
      where: {
        tenantId_viewerUserId_filmId: {
          tenantId,
          viewerUserId,
          filmId,
        },
      },
    });
  }

  async removeFromWatchlist(tenantId: string, viewerUserId: string, filmId: string) {
    return prisma.watchlistItem.delete({
      where: {
        tenantId_viewerUserId_filmId: {
          tenantId,
          viewerUserId,
          filmId,
        },
      },
    });
  }

  async listWatchlist(tenantId: string, viewerUserId: string) {
    return prisma.watchlistItem.findMany({
      where: { tenantId, viewerUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        film: {
          include: {
            pricing: true,
            availability: true,
          },
        },
      },
    });
  }
}

export const watchlistRepository = new WatchlistRepository();
export default watchlistRepository;
