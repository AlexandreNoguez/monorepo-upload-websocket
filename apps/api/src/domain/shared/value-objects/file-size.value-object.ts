import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

export class FileSize {
  private constructor(private readonly sizeInBytes: bigint) {}

  public static create(sizeInBytes: bigint | number): FileSize {
    const normalizedSizeInBytes =
      typeof sizeInBytes === 'number' ? BigInt(sizeInBytes) : sizeInBytes;

    if (normalizedSizeInBytes <= 0n) {
      throw new DomainRuleViolationError('File size must be greater than zero bytes.');
    }

    return new FileSize(normalizedSizeInBytes);
  }

  public get bytes(): bigint {
    return this.sizeInBytes;
  }
}
