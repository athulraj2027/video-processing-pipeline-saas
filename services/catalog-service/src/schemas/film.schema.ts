import { z } from 'zod';

export const CatalogStatusEnum = z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED', 'UNPUBLISHED']);
export const ContentTypeEnum = z.enum(['MOVIE', 'SERIES', 'EPISODE', 'SHORT', 'TRAILER', 'BONUS']);
export const PricingModelEnum = z.enum(['PPV', 'RENTAL', 'SUBSCRIPTION', 'HYBRID', 'FREE']);
export const AccessWindowTypeEnum = z.enum(['NONE', 'RENTAL_24H', 'RENTAL_48H', 'RENTAL_72H', 'LIFETIME', 'CUSTOM']);
export const GeoRestrictionModeEnum = z.enum(['ALLOWLIST', 'BLOCKLIST', 'NONE']);
export const VisibilityEnum = z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']);
export const MediaLanguageKindEnum = z.enum(['AUDIO', 'SUBTITLE', 'DUB']);

export const createFilmSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric or hyphens in lowercase'),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  synopsis: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  contentType: ContentTypeEnum.optional(),
  status: CatalogStatusEnum.optional(),
  visibility: VisibilityEnum.optional(),
  pricingModel: PricingModelEnum.optional(),
  accessWindow: AccessWindowTypeEnum.optional(),
  runtimeSeconds: z.number().int().nonnegative().nullable().optional(),
  releaseDate: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  publishAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  unpublishAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  ageRating: z.string().nullable().optional(),
  maturityRating: z.string().nullable().optional(),
  languageCode: z.string().nullable().optional(),
  countryOfOrigin: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isOriginal: z.boolean().optional(),
  posterUrl: z.string().url().nullable().optional().or(z.literal('')),
  backdropUrl: z.string().url().nullable().optional().or(z.literal('')),
  trailerUrl: z.string().url().nullable().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().nullable().optional().or(z.literal('')),
  searchKeywords: z.array(z.string()).optional(),
  cast: z.array(z.any()).optional(),
  crew: z.array(z.any()).optional(),
  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  geoRestrictionMode: GeoRestrictionModeEnum.optional(),
  allowedCountries: z.array(z.string()).optional(),
  blockedCountries: z.array(z.string()).optional(),
  drmRequired: z.boolean().optional(),
  watermarkRequired: z.boolean().optional(),
});

export const updateFilmSchema = createFilmSchema.partial();

// Pricing
export const updateFilmPricingSchema = z.object({
  currency: z.string().min(3).max(3).default('USD'),
  ppvPrice: z.number().nullable().optional(),
  rentalPrice: z.number().nullable().optional(),
  subscriptionPrice: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  compareAtPrice: z.number().nullable().optional(),
  rentalDurationHours: z.number().int().nonnegative().nullable().optional(),
  subscriptionIncluded: z.boolean().optional(),
  bundleEligible: z.boolean().optional(),
  taxInclusive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// Availability
export const updateFilmAvailabilitySchema = z.object({
  startsAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  endsAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  preorderStartsAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  preorderEndsAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
  isAvailable: z.boolean().optional(),
  regionLocked: z.boolean().optional(),
});

// Asset
export const createFilmAssetSchema = z.object({
  type: z.string().min(1),
  storageKey: z.string().min(1),
  url: z.string().url().nullable().optional().or(z.literal('')),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.coerce.number().nullable().optional(),
  checksum: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  bitrateKbps: z.number().int().nullable().optional(),
  isPrimary: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});
export const updateFilmAssetSchema = createFilmAssetSchema.partial();

// Subtitle
export const createFilmSubtitleSchema = z.object({
  languageCode: z.string().min(2).max(10),
  kind: MediaLanguageKindEnum.optional(),
  label: z.string().nullable().optional(),
  storageKey: z.string().min(1),
  url: z.string().url().nullable().optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
  isForced: z.boolean().optional(),
  isAutoGenerated: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});
export const updateFilmSubtitleSchema = createFilmSubtitleSchema.partial();

// Chapter
export const createFilmChapterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().nullable().optional(),
  startSeconds: z.number().int().nonnegative(),
  endSeconds: z.number().int().nonnegative().nullable().optional(),
  orderIndex: z.number().int().nonnegative(),
});
export const updateFilmChapterSchema = createFilmChapterSchema.partial();

// Variant
export const createFilmVariantSchema = z.object({
  name: z.string().min(1),
  qualityLabel: z.string().min(1),
  codec: z.string().nullable().optional(),
  container: z.string().nullable().optional(),
  storageKey: z.string().min(1),
  manifestUrl: z.string().url().nullable().optional().or(z.literal('')),
  bitrateKbps: z.number().int().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  fps: z.number().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  isDefault: z.boolean().optional(),
  isReady: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});
export const updateFilmVariantSchema = createFilmVariantSchema.partial();
