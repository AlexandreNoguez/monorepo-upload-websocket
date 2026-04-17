import { DomainRuleViolationError } from '../../shared/errors/domain-rule-violation.error';
import { BlobReference } from '../../shared/value-objects/blob-reference.value-object';
import { FileSize } from '../../shared/value-objects/file-size.value-object';
import { MimeType } from '../../shared/value-objects/mime-type.value-object';
import { OriginalFileName } from '../../shared/value-objects/original-file-name.value-object';
import { ImageAssetStatus } from '../enums/image-asset-status.enum';
import { ImageAssetId } from '../value-objects/image-asset-id.value-object';

export interface ImageAssetProperties {
  id: ImageAssetId;
  originalFileName: OriginalFileName;
  mimeType: MimeType;
  fileSize: FileSize;
  originalBlobReference: BlobReference;
  status: ImageAssetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ImageAsset {
  private constructor(private readonly properties: ImageAssetProperties) {}

  public static create(properties: ImageAssetProperties): ImageAsset {
    if (properties.updatedAt < properties.createdAt) {
      throw new DomainRuleViolationError('Image asset updated date cannot be before created date.');
    }

    return new ImageAsset(properties);
  }

  public confirmUpload(currentDate: Date): void {
    this.ensureStatusIs(ImageAssetStatus.UploadRequested, 'Only upload requested images can be confirmed.');
    this.properties.status = ImageAssetStatus.Uploaded;
    this.properties.updatedAt = currentDate;
  }

  public markAsProcessing(currentDate: Date): void {
    this.ensureStatusIs(ImageAssetStatus.Uploaded, 'Only uploaded images can start processing.');
    this.properties.status = ImageAssetStatus.Processing;
    this.properties.updatedAt = currentDate;
  }

  public markAsProcessed(currentDate: Date): void {
    this.ensureStatusIs(ImageAssetStatus.Processing, 'Only processing images can be marked as processed.');
    this.properties.status = ImageAssetStatus.Processed;
    this.properties.updatedAt = currentDate;
  }

  public markAsFailed(currentDate: Date): void {
    if (
      this.properties.status === ImageAssetStatus.Processed ||
      this.properties.status === ImageAssetStatus.Failed
    ) {
      throw new DomainRuleViolationError('Only active image assets can be marked as failed.');
    }

    this.properties.status = ImageAssetStatus.Failed;
    this.properties.updatedAt = currentDate;
  }

  public get id(): ImageAssetId {
    return this.properties.id;
  }

  public get originalFileName(): OriginalFileName {
    return this.properties.originalFileName;
  }

  public get mimeType(): MimeType {
    return this.properties.mimeType;
  }

  public get fileSize(): FileSize {
    return this.properties.fileSize;
  }

  public get originalBlobReference(): BlobReference {
    return this.properties.originalBlobReference;
  }

  public get status(): ImageAssetStatus {
    return this.properties.status;
  }

  public get createdAt(): Date {
    return new Date(this.properties.createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this.properties.updatedAt);
  }

  private ensureStatusIs(expectedStatus: ImageAssetStatus, failureMessage: string): void {
    if (this.properties.status !== expectedStatus) {
      throw new DomainRuleViolationError(failureMessage);
    }
  }
}
