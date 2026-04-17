import { BlobReference } from '../../shared/value-objects/blob-reference.value-object';
import { FileSize } from '../../shared/value-objects/file-size.value-object';
import { ImageDimensions } from '../../shared/value-objects/image-dimensions.value-object';
import { MimeType } from '../../shared/value-objects/mime-type.value-object';
import { ProcessedVariantKind } from '../enums/processed-variant-kind.enum';
import { ProcessedVariantId } from '../value-objects/processed-variant-id.value-object';
import { ProcessingJobId } from '../value-objects/processing-job-id.value-object';

export interface ProcessedVariantProperties {
  id: ProcessedVariantId;
  processingJobId: ProcessingJobId;
  variantKind: ProcessedVariantKind;
  blobReference: BlobReference;
  mimeType: MimeType;
  fileSize?: FileSize;
  dimensions?: ImageDimensions;
  createdAt: Date;
}

export class ProcessedVariant {
  private constructor(private readonly properties: ProcessedVariantProperties) {}

  public static create(properties: ProcessedVariantProperties): ProcessedVariant {
    return new ProcessedVariant(properties);
  }

  public get id(): ProcessedVariantId {
    return this.properties.id;
  }

  public get processingJobId(): ProcessingJobId {
    return this.properties.processingJobId;
  }

  public get variantKind(): ProcessedVariantKind {
    return this.properties.variantKind;
  }

  public get blobReference(): BlobReference {
    return this.properties.blobReference;
  }

  public get mimeType(): MimeType {
    return this.properties.mimeType;
  }

  public get fileSize(): FileSize | undefined {
    return this.properties.fileSize;
  }

  public get dimensions(): ImageDimensions | undefined {
    return this.properties.dimensions;
  }

  public get createdAt(): Date {
    return new Date(this.properties.createdAt);
  }
}
