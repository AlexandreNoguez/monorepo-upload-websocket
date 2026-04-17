import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export abstract class UniqueIdentifier {
  protected constructor(
    private readonly rawIdentifier: string,
    private readonly identifierLabel: string
  ) {
    if (!UUID_PATTERN.test(rawIdentifier)) {
      throw new DomainRuleViolationError(`${identifierLabel} must be a valid UUID.`);
    }
  }

  public get value(): string {
    return this.rawIdentifier;
  }

  public equals(otherIdentifier: UniqueIdentifier): boolean {
    return this.rawIdentifier === otherIdentifier.value;
  }

  public toString(): string {
    return this.rawIdentifier;
  }
}
