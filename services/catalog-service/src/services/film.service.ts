import { filmRepository } from '../repositories/film.repository.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../errors/appError.js';

export class FilmService {
  private repo = filmRepository;

  async createFilm(tenantId: string, data: any) {
    const existing = await this.repo.getFilmBySlug(tenantId, data.slug);
    if (existing) {
      throw new ConflictError(`Film with slug '${data.slug}' already exists for this tenant`);
    }
    return this.repo.createFilm(tenantId, data);
  }

  async getFilmById(tenantId: string, id: string, userRole?: string) {
    const film = await this.repo.getFilmById(tenantId, id);
    if (!film) {
      throw new NotFoundError(`Film with ID '${id}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    if (!isAdmin) {
      if (film.status !== 'PUBLISHED' || film.visibility === 'PRIVATE') {
        throw new NotFoundError(`Film with ID '${id}' not found`);
      }
    }
    return film;
  }

  async getFilmBySlug(tenantId: string, slug: string, userRole?: string) {
    const film = await this.repo.getFilmBySlug(tenantId, slug);
    if (!film) {
      throw new NotFoundError(`Film with slug '${slug}' not found`);
    }

    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    if (!isAdmin) {
      if (film.status !== 'PUBLISHED' || film.visibility === 'PRIVATE') {
        throw new NotFoundError(`Film with slug '${slug}' not found`);
      }
    }
    return film;
  }

  async updateFilm(tenantId: string, id: string, data: any) {
    await this.getFilmById(tenantId, id, 'tenant_admin'); // use admin bypass to get draft/private

    if (data.slug) {
      const existing = await this.repo.getFilmBySlug(tenantId, data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Film with slug '${data.slug}' already exists`);
      }
    }

    return this.repo.updateFilm(tenantId, id, data);
  }

  async deleteFilm(tenantId: string, id: string) {
    await this.getFilmById(tenantId, id, 'tenant_admin');
    return this.repo.deleteFilm(tenantId, id);
  }

  async listFilms(tenantId: string, filters: any = {}, userRole?: string) {
    const isAdmin = userRole === 'super_admin' || userRole === 'tenant_admin' || userRole === 'tenant_staff';
    
    const resolvedFilters = { ...filters };
    if (!isAdmin) {
      resolvedFilters.status = 'PUBLISHED';
      resolvedFilters.visibility = 'PUBLIC'; // UNLISTED films are hidden from public lists
    }

    return this.repo.listFilms(tenantId, resolvedFilters);
  }

  // Pricing & Availability
  async updatePricing(tenantId: string, filmId: string, pricingData: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    return this.repo.updatePricing(filmId, pricingData);
  }

  async updateAvailability(tenantId: string, filmId: string, availabilityData: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    return this.repo.updateAvailability(filmId, availabilityData);
  }

  // Subordinate Assets
  async addAsset(tenantId: string, filmId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    return this.repo.addAsset(filmId, data);
  }

  async updateAsset(tenantId: string, filmId: string, assetId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const asset = await this.repo.getAssetById(assetId);
    if (!asset || asset.filmId !== filmId) {
      throw new NotFoundError(`Asset with ID '${assetId}' not found for this film`);
    }
    return this.repo.updateAsset(assetId, data);
  }

  async deleteAsset(tenantId: string, filmId: string, assetId: string) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const asset = await this.repo.getAssetById(assetId);
    if (!asset || asset.filmId !== filmId) {
      throw new NotFoundError(`Asset with ID '${assetId}' not found for this film`);
    }
    return this.repo.deleteAsset(assetId);
  }

  // Subordinate Subtitles
  async addSubtitle(tenantId: string, filmId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    return this.repo.addSubtitle(filmId, data);
  }

  async updateSubtitle(tenantId: string, filmId: string, subtitleId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const subtitle = await this.repo.getSubtitleById(subtitleId);
    if (!subtitle || subtitle.filmId !== filmId) {
      throw new NotFoundError(`Subtitle with ID '${subtitleId}' not found for this film`);
    }
    return this.repo.updateSubtitle(subtitleId, data);
  }

  async deleteSubtitle(tenantId: string, filmId: string, subtitleId: string) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const subtitle = await this.repo.getSubtitleById(subtitleId);
    if (!subtitle || subtitle.filmId !== filmId) {
      throw new NotFoundError(`Subtitle with ID '${subtitleId}' not found for this film`);
    }
    return this.repo.deleteSubtitle(subtitleId);
  }

  // Subordinate Chapters
  async addChapter(tenantId: string, filmId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    return this.repo.addChapter(filmId, data);
  }

  async updateChapter(tenantId: string, filmId: string, chapterId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const chapter = await this.repo.getChapterById(chapterId);
    if (!chapter || chapter.filmId !== filmId) {
      throw new NotFoundError(`Chapter with ID '${chapterId}' not found for this film`);
    }
    return this.repo.updateChapter(chapterId, data);
  }

  async deleteChapter(tenantId: string, filmId: string, chapterId: string) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const chapter = await this.repo.getChapterById(chapterId);
    if (!chapter || chapter.filmId !== filmId) {
      throw new NotFoundError(`Chapter with ID '${chapterId}' not found for this film`);
    }
    return this.repo.deleteChapter(chapterId);
  }

  // Subordinate Variants
  async addVariant(tenantId: string, filmId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    return this.repo.addVariant(filmId, data);
  }

  async updateVariant(tenantId: string, filmId: string, variantId: string, data: any) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const variant = await this.repo.getVariantById(variantId);
    if (!variant || variant.filmId !== filmId) {
      throw new NotFoundError(`Variant with ID '${variantId}' not found for this film`);
    }
    return this.repo.updateVariant(variantId, data);
  }

  async deleteVariant(tenantId: string, filmId: string, variantId: string) {
    await this.getFilmById(tenantId, filmId, 'tenant_admin');
    const variant = await this.repo.getVariantById(variantId);
    if (!variant || variant.filmId !== filmId) {
      throw new NotFoundError(`Variant with ID '${variantId}' not found for this film`);
    }
    return this.repo.deleteVariant(variantId);
  }
}

export const filmService = new FilmService();
export default filmService;
