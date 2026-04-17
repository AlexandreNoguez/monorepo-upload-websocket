export class DomainRuleViolationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'DomainRuleViolationError';
  }
}
