import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

export class ProgressPercentage {
  private constructor(private readonly rawPercentage: number) {}

  public static create(rawPercentage: number): ProgressPercentage {
    if (!Number.isInteger(rawPercentage) || rawPercentage < 0 || rawPercentage > 100) {
      throw new DomainRuleViolationError('Progress percentage must be an integer from 0 to 100.');
    }

    return new ProgressPercentage(rawPercentage);
  }

  public get value(): number {
    return this.rawPercentage;
  }

  public isGreaterThan(otherProgressPercentage: ProgressPercentage): boolean {
    return this.rawPercentage > otherProgressPercentage.value;
  }
}
