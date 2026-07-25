import { watchlistRepository } from '../repositories/watchlist.repository.js';
import { filmRepository } from '../repositories/film.repository.js';
import { CreateWatchlistItemDto } from '../schemas/watchlist.schema.js';
import { NotFoundError } from '../errors/appError.js';

export class WatchlistService {
  private repo = watchlistRepository;
  private filmRepo = filmRepository;

  async addToWatchlist(tenantId: string, viewerUserId: string, data: CreateWatchlistItemDto) {
    const film = await this.filmRepo.getFilmById(tenantId, data.filmId);
    if (!film) {
      throw new NotFoundError(`Film with ID '${data.filmId}' not found`);
    }
    return this.repo.addToWatchlist(tenantId, viewerUserId, data);
  }

  async removeFromWatchlist(tenantId: string, viewerUserId: string, filmId: string) {
    const item = await this.repo.getWatchlistItem(tenantId, viewerUserId, filmId);
    if (!item) {
      throw new NotFoundError(`Film is not in your watchlist`);
    }
    return this.repo.removeFromWatchlist(tenantId, viewerUserId, filmId);
  }

  async listWatchlist(tenantId: string, viewerUserId: string) {
    return this.repo.listWatchlist(tenantId, viewerUserId);
  }
}

export const watchlistService = new WatchlistService();
export default watchlistService;
