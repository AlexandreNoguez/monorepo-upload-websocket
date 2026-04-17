import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

export interface BlobReferenceProperties {
  containerName: string;
  blobKey: string;
}

export class BlobReference {
  private constructor(private readonly properties: BlobReferenceProperties) {}

  public static create(properties: BlobReferenceProperties): BlobReference {
    const normalizedContainerName = properties.containerName.trim();
    const normalizedBlobKey = properties.blobKey.trim();

    if (normalizedContainerName.length === 0) {
      throw new DomainRuleViolationError('Blob container name cannot be empty.');
    }

    if (normalizedBlobKey.length === 0) {
      throw new DomainRuleViolationError('Blob key cannot be empty.');
    }

    return new BlobReference({
      containerName: normalizedContainerName,
      blobKey: normalizedBlobKey
    });
  }

  public get containerName(): string {
    return this.properties.containerName;
  }

  public get blobKey(): string {
    return this.properties.blobKey;
  }

  public equals(otherBlobReference: BlobReference): boolean {
    return (
      this.containerName === otherBlobReference.containerName &&
      this.blobKey === otherBlobReference.blobKey
    );
  }
}
