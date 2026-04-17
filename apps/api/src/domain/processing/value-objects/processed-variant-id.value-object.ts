import { UniqueIdentifier } from '../../shared/value-objects/unique-identifier.value-object';

export class ProcessedVariantId extends UniqueIdentifier {
  private constructor(rawProcessedVariantId: string) {
    super(rawProcessedVariantId, 'ProcessedVariantId');
  }

  public static create(rawProcessedVariantId: string): ProcessedVariantId {
    return new ProcessedVariantId(rawProcessedVariantId);
  }
}
