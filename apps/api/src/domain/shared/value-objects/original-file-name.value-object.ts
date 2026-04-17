import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

const MAXIMUM_FILE_NAME_LENGTH = 255;

export class OriginalFileName {
  private constructor(private readonly rawFileName: string) {}

  public static create(rawFileName: string): OriginalFileName {
    const normalizedFileName = rawFileName.trim();

    if (normalizedFileName.length === 0) {
      throw new DomainRuleViolationError('Original file name cannot be empty.');
    }

    if (normalizedFileName.length > MAXIMUM_FILE_NAME_LENGTH) {
      throw new DomainRuleViolationError(
        `Original file name cannot be longer than ${MAXIMUM_FILE_NAME_LENGTH} characters.`
      );
    }

    return new OriginalFileName(normalizedFileName);
  }

  public get value(): string {
    return this.rawFileName;
  }
}
