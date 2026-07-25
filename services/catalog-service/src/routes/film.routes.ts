import { Router } from 'express';
import {
  createFilm,
  getFilm,
  getFilmBySlug,
  updateFilm,
  deleteFilm,
  listFilms,
  updatePricing,
  updateAvailability,
  addAsset,
  updateAsset,
  deleteAsset,
  addSubtitle,
  updateSubtitle,
  deleteSubtitle,
  addChapter,
  updateChapter,
  deleteChapter,
  addVariant,
  updateVariant,
  deleteVariant,
} from '../controllers/film.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import {
  createFilmSchema,
  updateFilmSchema,
  updateFilmPricingSchema,
  updateFilmAvailabilitySchema,
  createFilmAssetSchema,
  updateFilmAssetSchema,
  createFilmSubtitleSchema,
  updateFilmSubtitleSchema,
  createFilmChapterSchema,
  updateFilmChapterSchema,
  createFilmVariantSchema,
  updateFilmVariantSchema,
} from '../schemas/film.schema.js';

const router = Router();

// Public Reading Endpoints
router.get('/', optionalAuthenticate, requireTenantAccess, listFilms);
router.get('/:id', optionalAuthenticate, requireTenantAccess, getFilm);
router.get('/slug/:slug', optionalAuthenticate, requireTenantAccess, getFilmBySlug);

// Tenant Administration Modification Endpoints
const writeRoles = requireRole(['super_admin', 'tenant_admin', 'tenant_staff']);

// Film Metadata Operations
router.post('/', authenticate, requireTenantAccess, writeRoles, validateBody(createFilmSchema), createFilm);
router.put('/:id', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmSchema), updateFilm);
router.delete('/:id', authenticate, requireTenantAccess, writeRoles, deleteFilm);

// Film Pricing Operations
router.put('/:filmId/pricing', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmPricingSchema), updatePricing);

// Film Availability Operations
router.put('/:filmId/availability', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmAvailabilitySchema), updateAvailability);

// Subordinate Assets
router.post('/:filmId/assets', authenticate, requireTenantAccess, writeRoles, validateBody(createFilmAssetSchema), addAsset);
router.put('/:filmId/assets/:assetId', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmAssetSchema), updateAsset);
router.delete('/:filmId/assets/:assetId', authenticate, requireTenantAccess, writeRoles, deleteAsset);

// Subordinate Subtitles
router.post('/:filmId/subtitles', authenticate, requireTenantAccess, writeRoles, validateBody(createFilmSubtitleSchema), addSubtitle);
router.put('/:filmId/subtitles/:subtitleId', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmSubtitleSchema), updateSubtitle);
router.delete('/:filmId/subtitles/:subtitleId', authenticate, requireTenantAccess, writeRoles, deleteSubtitle);

// Subordinate Chapters
router.post('/:filmId/chapters', authenticate, requireTenantAccess, writeRoles, validateBody(createFilmChapterSchema), addChapter);
router.put('/:filmId/chapters/:chapterId', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmChapterSchema), updateChapter);
router.delete('/:filmId/chapters/:chapterId', authenticate, requireTenantAccess, writeRoles, deleteChapter);

// Subordinate Variants
router.post('/:filmId/variants', authenticate, requireTenantAccess, writeRoles, validateBody(createFilmVariantSchema), addVariant);
router.put('/:filmId/variants/:variantId', authenticate, requireTenantAccess, writeRoles, validateBody(updateFilmVariantSchema), updateVariant);
router.delete('/:filmId/variants/:variantId', authenticate, requireTenantAccess, writeRoles, deleteVariant);

export default router;
