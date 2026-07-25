import { z } from 'zod';

export const UploadStatusEnum = z.enum([
  'CREATED', 'VALIDATING', 'VALIDATED', 'QUEUED', 'UPLOADING',
  'UPLOADED', 'PROCESSING', 'READY_FOR_TRANSCODE', 'COMPLETED', 'FAILED', 'CANCELED'
]);

export const UploadSourceTypeEnum = z.enum([
  'DIRECT', 'RESUMABLE', 'S3_IMPORT', 'URL_IMPORT', 'MIGRATED'
]);

export const UploadValidationStatusEnum = z.enum([
  'PENDING', 'PASSED', 'FAILED', 'WARNING'
]);

export const UploadValidationCodeEnum = z.enum([
  'FILE_TOO_SMALL', 'FILE_TOO_LARGE', 'INVALID_CONTAINER', 'UNSUPPORTED_CODEC',
  'BAD_DURATION', 'BAD_BITRATE', 'BAD_RESOLUTION', 'CORRUPTED_FILE',
  'MISSING_AUDIO', 'MISSING_VIDEO', 'FILE_HASH_MISMATCH', 'VIRUS_SCAN_FAILED', 'UNKNOWN'
]);

export const StorageProviderEnum = z.enum([
  'R2', 'S3', 'LOCAL', 'GCS'
]);

export const createUploadJobSchema = z.object({
  filmId: z.string().uuid().nullable().optional(),
  sourceType: UploadSourceTypeEnum.optional(),
  originalFileName: z.string().min(1, 'Original file name is required').max(255),
  contentType: z.string().nullable().optional(),
  fileSizeBytes: z.coerce.number().int().nonnegative().nullable().optional(),
  checksumSha256: z.string().nullable().optional(),
  checksumMd5: z.string().nullable().optional(),
  
  storageProvider: StorageProviderEnum.optional(),
  storageBucket: z.string().nullable().optional(),
  storageKey: z.string().nullable().optional(),
  storageRegion: z.string().nullable().optional(),
  uploadUrl: z.string().url().nullable().optional().or(z.literal('')),
  uploadExpiresAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
});

export const updateUploadJobSchema = createUploadJobSchema.partial().extend({
  status: UploadStatusEnum.optional(),
  durationSeconds: z.number().int().nonnegative().nullable().optional(),
  width: z.number().int().nonnegative().nullable().optional(),
  height: z.number().int().nonnegative().nullable().optional(),
  bitrateKbps: z.number().int().nonnegative().nullable().optional(),
  fps: z.number().nullable().optional(),
  codecVideo: z.string().nullable().optional(),
  codecAudio: z.string().nullable().optional(),
  containerFormat: z.string().nullable().optional(),
  validationStatus: UploadValidationStatusEnum.optional(),
  validationSummary: z.record(z.any()).optional(),
  validationReport: z.array(z.any()).optional(),
  probeData: z.record(z.any()).optional(),
  errorMessage: z.string().nullable().optional(),
  errorCode: z.string().nullable().optional(),
  retryCount: z.number().int().nonnegative().optional(),
  maxRetries: z.number().int().nonnegative().optional(),
});

export const createUploadPartSchema = z.object({
  partNumber: z.number().int().positive(),
  byteStart: z.coerce.number().int().nonnegative().nullable().optional(),
  byteEnd: z.coerce.number().int().nonnegative().nullable().optional(),
  fileSizeBytes: z.coerce.number().int().nonnegative().nullable().optional(),
  etag: z.string().nullable().optional(),
  checksumSha256: z.string().nullable().optional(),
  uploadedAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date().nullable()).optional(),
});

export const createUploadValidationSchema = z.object({
  code: UploadValidationCodeEnum,
  status: UploadValidationStatusEnum.optional(),
  severity: z.string().default('error'),
  message: z.string().min(1),
  details: z.record(z.any()).optional(),
  fieldName: z.string().nullable().optional(),
  expectedValue: z.string().nullable().optional(),
  actualValue: z.string().nullable().optional(),
});

export const createUploadEventSchema = z.object({
  eventType: z.string().min(1),
  payload: z.record(z.any()).optional(),
  occurredAt: z.preprocess((val) => (typeof val === 'string' && val !== '' ? new Date(val) : val), z.date()).optional(),
});

export const createUploadArtifactSchema = z.object({
  kind: z.string().min(1),
  name: z.string().min(1),
  storageProvider: StorageProviderEnum.optional(),
  storageKey: z.string().min(1),
  url: z.string().url().nullable().optional().or(z.literal('')),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.coerce.number().int().nonnegative().nullable().optional(),
  metadata: z.record(z.any()).optional(),
});
