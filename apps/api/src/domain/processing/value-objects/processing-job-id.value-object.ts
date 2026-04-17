import { UniqueIdentifier } from '../../shared/value-objects/unique-identifier.value-object';

export class ProcessingJobId extends UniqueIdentifier {
  private constructor(rawProcessingJobId: string) {
    super(rawProcessingJobId, 'ProcessingJobId');
  }

  public static create(rawProcessingJobId: string): ProcessingJobId {
    return new ProcessingJobId(rawProcessingJobId);
  }
}
