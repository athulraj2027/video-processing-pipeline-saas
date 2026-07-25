-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('CREATED', 'VALIDATING', 'VALIDATED', 'QUEUED', 'UPLOADING', 'UPLOADED', 'PROCESSING', 'READY_FOR_TRANSCODE', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UploadSourceType" AS ENUM ('DIRECT', 'RESUMABLE', 'S3_IMPORT', 'URL_IMPORT', 'MIGRATED');

-- CreateEnum
CREATE TYPE "UploadValidationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'WARNING');

-- CreateEnum
CREATE TYPE "UploadValidationCode" AS ENUM ('FILE_TOO_SMALL', 'FILE_TOO_LARGE', 'INVALID_CONTAINER', 'UNSUPPORTED_CODEC', 'BAD_DURATION', 'BAD_BITRATE', 'BAD_RESOLUTION', 'CORRUPTED_FILE', 'MISSING_AUDIO', 'MISSING_VIDEO', 'FILE_HASH_MISMATCH', 'VIRUS_SCAN_FAILED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('R2', 'S3', 'LOCAL', 'GCS');

-- CreateEnum
CREATE TYPE "UploadJobKind" AS ENUM ('FILE_CHECK', 'METADATA_CHECK', 'MEDIA_PROBE', 'VIRUS_SCAN', 'CHECKSUM_VERIFY', 'OBJECT_STORE_WRITE', 'PIPELINE_ENQUEUE');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "films" (
    "id" TEXT NOT NULL,

    CONSTRAINT "films_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_jobs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "filmId" TEXT,
    "sourceType" "UploadSourceType" NOT NULL DEFAULT 'DIRECT',
    "status" "UploadStatus" NOT NULL DEFAULT 'CREATED',
    "originalFileName" TEXT NOT NULL,
    "contentType" TEXT,
    "fileSizeBytes" BIGINT,
    "checksumSha256" TEXT,
    "checksumMd5" TEXT,
    "durationSeconds" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "bitrateKbps" INTEGER,
    "fps" DOUBLE PRECISION,
    "codecVideo" TEXT,
    "codecAudio" TEXT,
    "containerFormat" TEXT,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'R2',
    "storageBucket" TEXT,
    "storageKey" TEXT,
    "storageRegion" TEXT,
    "uploadUrl" TEXT,
    "uploadExpiresAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "validationStatus" "UploadValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validationSummary" JSONB NOT NULL DEFAULT '{}',
    "validationReport" JSONB NOT NULL DEFAULT '[]',
    "probeData" JSONB NOT NULL DEFAULT '{}',
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdById" TEXT,
    "updatedById" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_parts" (
    "id" TEXT NOT NULL,
    "uploadJobId" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "byteStart" BIGINT,
    "byteEnd" BIGINT,
    "fileSizeBytes" BIGINT,
    "etag" TEXT,
    "checksumSha256" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_validations" (
    "id" TEXT NOT NULL,
    "uploadJobId" TEXT NOT NULL,
    "code" "UploadValidationCode" NOT NULL,
    "status" "UploadValidationStatus" NOT NULL DEFAULT 'PENDING',
    "severity" TEXT NOT NULL DEFAULT 'error',
    "message" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "fieldName" TEXT,
    "expectedValue" TEXT,
    "actualValue" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_events" (
    "id" TEXT NOT NULL,
    "uploadJobId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_artifacts" (
    "id" TEXT NOT NULL,
    "uploadJobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'R2',
    "storageKey" TEXT NOT NULL,
    "url" TEXT,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "upload_jobs_tenantId_status_idx" ON "upload_jobs"("tenantId", "status");

-- CreateIndex
CREATE INDEX "upload_jobs_tenantId_validationStatus_idx" ON "upload_jobs"("tenantId", "validationStatus");

-- CreateIndex
CREATE INDEX "upload_jobs_tenantId_filmId_idx" ON "upload_jobs"("tenantId", "filmId");

-- CreateIndex
CREATE INDEX "upload_jobs_storageKey_idx" ON "upload_jobs"("storageKey");

-- CreateIndex
CREATE INDEX "upload_parts_uploadJobId_idx" ON "upload_parts"("uploadJobId");

-- CreateIndex
CREATE UNIQUE INDEX "upload_parts_uploadJobId_partNumber_key" ON "upload_parts"("uploadJobId", "partNumber");

-- CreateIndex
CREATE INDEX "upload_validations_uploadJobId_status_idx" ON "upload_validations"("uploadJobId", "status");

-- CreateIndex
CREATE INDEX "upload_validations_uploadJobId_code_idx" ON "upload_validations"("uploadJobId", "code");

-- CreateIndex
CREATE INDEX "upload_events_uploadJobId_eventType_idx" ON "upload_events"("uploadJobId", "eventType");

-- CreateIndex
CREATE INDEX "upload_events_uploadJobId_occurredAt_idx" ON "upload_events"("uploadJobId", "occurredAt");

-- CreateIndex
CREATE INDEX "upload_artifacts_uploadJobId_kind_idx" ON "upload_artifacts"("uploadJobId", "kind");

-- CreateIndex
CREATE INDEX "upload_artifacts_storageKey_idx" ON "upload_artifacts"("storageKey");

-- AddForeignKey
ALTER TABLE "upload_jobs" ADD CONSTRAINT "upload_jobs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_jobs" ADD CONSTRAINT "upload_jobs_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "films"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_parts" ADD CONSTRAINT "upload_parts_uploadJobId_fkey" FOREIGN KEY ("uploadJobId") REFERENCES "upload_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_validations" ADD CONSTRAINT "upload_validations_uploadJobId_fkey" FOREIGN KEY ("uploadJobId") REFERENCES "upload_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_events" ADD CONSTRAINT "upload_events_uploadJobId_fkey" FOREIGN KEY ("uploadJobId") REFERENCES "upload_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_artifacts" ADD CONSTRAINT "upload_artifacts_uploadJobId_fkey" FOREIGN KEY ("uploadJobId") REFERENCES "upload_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
