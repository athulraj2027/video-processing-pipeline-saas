import { ratingRepository } from '../repositories/rating.repository.js';
import { filmRepository } from '../repositories/film.repository.js';
import { CreateRatingDto, UpdateRatingDto } from '../schemas/rating.schema.js';
import { NotFoundError, ForbiddenError } from '../errors/appError.js';

export class RatingService {
  private repo = ratingRepository;
  private filmRepo = filmRepository;

  async addOrUpdateRating(tenantId: string, viewerUserId: string, data: CreateRatingDto) {
    const film = await this.filmRepo.getFilmById(tenantId, data.filmId);
    if (!film) {
      throw new NotFoundError(`Film with ID '${data.filmId}' not found`);
    }
    return this.repo.addOrUpdateRating(tenantId, viewerUserId, data);
  }

  async updateRating(tenantId: string, viewerUserId: string, ratingId: string, data: UpdateRatingDto, userRole?: string) {
    const rating = await this.repo.getRatingById(tenantId, ratingId);
    if (!rating) {
      throw new NotFoundError(`Rating with ID '${ratingId}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin';
    if (rating.viewerUserId !== viewerUserId && !isAdmin) {
      throw new ForbiddenError('You do not have permission to modify this review');
    }

    // Only admins can modify isPublished status
    if (data.isPublished !== undefined && !isAdmin) {
      delete data.isPublished;
    }

    return this.repo.updateRating(tenantId, ratingId, data);
  }

  async deleteRating(tenantId: string, viewerUserId: string, ratingId: string, userRole?: string) {
    const rating = await this.repo.getRatingById(tenantId, ratingId);
    if (!rating) {
      throw new NotFoundError(`Rating with ID '${ratingId}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin';
    if (rating.viewerUserId !== viewerUserId && !isAdmin) {
      throw new ForbiddenError('You do not have permission to delete this review');
    }

    return this.repo.deleteRating(tenantId, ratingId);
  }

  async listRatingsForFilm(tenantId: string, filmId: string, userRole?: string) {
    const film = await this.filmRepo.getFilmById(tenantId, filmId);
    if (!film) {
      throw new NotFoundError(`Film with ID '${filmId}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    return this.repo.listRatingsForFilm(tenantId, filmId, !isAdmin);
  }

  async listAllRatings(tenantId: string) {
    return this.repo.listAllRatingsForTenant(tenantId);
  }
}

export const ratingService = new RatingService();
export default ratingService;
