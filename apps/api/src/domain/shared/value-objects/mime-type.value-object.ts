import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class MimeType {
  private constructor(private readonly rawMimeType: string) {}

  public static create(rawMimeType: string): MimeType {
    const normalizedMimeType = rawMimeType.trim().toLowerCase();

    if (!SUPPORTED_IMAGE_MIME_TYPES.has(normalizedMimeType)) {
      throw new DomainRuleViolationError(
        `Unsupported image MIME type "${rawMimeType}". Supported values are image/jpeg, image/png, and image/webp.`
      );
    }

    return new MimeType(normalizedMimeType);
  }

  public get value(): string {
    return this.rawMimeType;
  }
}
