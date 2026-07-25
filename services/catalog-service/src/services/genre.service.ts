import { genreRepository } from '../repositories/genre.repository.js';
import { CreateGenreDto, UpdateGenreDto } from '../schemas/genre.schema.js';
import { ConflictError, NotFoundError } from '../errors/appError.js';

export class GenreService {
  private repo = genreRepository;

  async createGenre(tenantId: string, data: CreateGenreDto) {
    const existing = await this.repo.getGenreBySlug(tenantId, data.slug);
    if (existing) {
      throw new ConflictError(`Genre with slug '${data.slug}' already exists for this tenant`);
    }
    return this.repo.createGenre(tenantId, data);
  }

  async getGenreById(tenantId: string, id: string) {
    const genre = await this.repo.getGenreById(tenantId, id);
    if (!genre) {
      throw new NotFoundError(`Genre with ID '${id}' not found`);
    }
    return genre;
  }

  async getGenreBySlug(tenantId: string, slug: string) {
    const genre = await this.repo.getGenreBySlug(tenantId, slug);
    if (!genre) {
      throw new NotFoundError(`Genre with slug '${slug}' not found`);
    }
    return genre;
  }

  async updateGenre(tenantId: string, id: string, data: UpdateGenreDto) {
    await this.getGenreById(tenantId, id);

    if (data.slug) {
      const existing = await this.repo.getGenreBySlug(tenantId, data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Genre with slug '${data.slug}' already exists`);
      }
    }

    return this.repo.updateGenre(tenantId, id, data);
  }

  async deleteGenre(tenantId: string, id: string) {
    await this.getGenreById(tenantId, id);
    return this.repo.deleteGenre(tenantId, id);
  }

  async listGenres(tenantId: string, isActiveOnly = false) {
    return this.repo.listGenres(tenantId, isActiveOnly);
  }
}

export const genreService = new GenreService();
export default genreService;
