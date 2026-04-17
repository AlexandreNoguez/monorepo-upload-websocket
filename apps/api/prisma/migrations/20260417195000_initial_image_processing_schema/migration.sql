CREATE TYPE "ImageAssetStatus" AS ENUM (
  'UPLOAD_REQUESTED',
  'UPLOADED',
  'PROCESSING',
  'PROCESSED',
  'FAILED'
);

CREATE TYPE "ProcessingJobStatus" AS ENUM (
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'FAILED'
);

CREATE TYPE "ProcessedVariantKind" AS ENUM (
  'THUMBNAIL',
  'GRAYSCALE'
);

CREATE TYPE "ProcessingEventType" AS ENUM (
  'UPLOAD_REQUESTED',
  'UPLOAD_CONFIRMED',
  'PROCESSING_STARTED',
  'PROCESSING_PROGRESS',
  'PROCESSING_COMPLETED',
  'PROCESSING_FAILED'
);

CREATE TABLE "image_assets" (
  "id" UUID NOT NULL,
  "original_file_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "file_size_in_bytes" BIGINT NOT NULL,
  "original_blob_container" TEXT NOT NULL,
  "original_blob_key" TEXT NOT NULL,
  "status" "ImageAssetStatus" NOT NULL DEFAULT 'UPLOAD_REQUESTED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "image_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "processing_jobs" (
  "id" UUID NOT NULL,
  "image_asset_id" UUID NOT NULL,
  "status" "ProcessingJobStatus" NOT NULL DEFAULT 'QUEUED',
  "progress_percentage" INTEGER NOT NULL DEFAULT 0,
  "failure_reason" TEXT,
  "function_execution_id" TEXT,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "processing_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "processed_variants" (
  "id" UUID NOT NULL,
  "processing_job_id" UUID NOT NULL,
  "variant_kind" "ProcessedVariantKind" NOT NULL,
  "blob_container" TEXT NOT NULL,
  "blob_key" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "file_size_in_bytes" BIGINT,
  "width_in_pixels" INTEGER,
  "height_in_pixels" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "processed_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "processing_events" (
  "id" UUID NOT NULL,
  "processing_job_id" UUID NOT NULL,
  "event_type" "ProcessingEventType" NOT NULL,
  "progress_percentage" INTEGER,
  "message" TEXT,
  "payload" JSONB,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "processing_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "image_assets_original_blob_key_key" ON "image_assets"("original_blob_key");
CREATE INDEX "image_assets_status_idx" ON "image_assets"("status");
CREATE INDEX "processing_jobs_image_asset_id_idx" ON "processing_jobs"("image_asset_id");
CREATE INDEX "processing_jobs_status_idx" ON "processing_jobs"("status");
CREATE UNIQUE INDEX "processed_variants_blob_key_key" ON "processed_variants"("blob_key");
CREATE UNIQUE INDEX "processed_variants_processing_job_id_variant_kind_key" ON "processed_variants"("processing_job_id", "variant_kind");
CREATE INDEX "processed_variants_processing_job_id_idx" ON "processed_variants"("processing_job_id");
CREATE INDEX "processing_events_processing_job_id_occurred_at_idx" ON "processing_events"("processing_job_id", "occurred_at");
CREATE INDEX "processing_events_event_type_idx" ON "processing_events"("event_type");

ALTER TABLE "processing_jobs"
  ADD CONSTRAINT "processing_jobs_image_asset_id_fkey"
  FOREIGN KEY ("image_asset_id")
  REFERENCES "image_assets"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "processed_variants"
  ADD CONSTRAINT "processed_variants_processing_job_id_fkey"
  FOREIGN KEY ("processing_job_id")
  REFERENCES "processing_jobs"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "processing_events"
  ADD CONSTRAINT "processing_events_processing_job_id_fkey"
  FOREIGN KEY ("processing_job_id")
  REFERENCES "processing_jobs"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
