import { ImageAssetId } from '../../image-assets/value-objects/image-asset-id.value-object';
import { DomainRuleViolationError } from '../../shared/errors/domain-rule-violation.error';
import { ProgressPercentage } from '../../shared/value-objects/progress-percentage.value-object';
import { ProcessingJobStatus } from '../enums/processing-job-status.enum';
import { ProcessingJobId } from '../value-objects/processing-job-id.value-object';

export interface ProcessingJobProperties {
  id: ProcessingJobId;
  imageAssetId: ImageAssetId;
  status: ProcessingJobStatus;
  progressPercentage: ProgressPercentage;
  failureReason?: string;
  functionExecutionId?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ProcessingJob {
  private constructor(private readonly properties: ProcessingJobProperties) {}

  public static create(properties: ProcessingJobProperties): ProcessingJob {
    if (properties.updatedAt < properties.createdAt) {
      throw new DomainRuleViolationError('Processing job updated date cannot be before created date.');
    }

    return new ProcessingJob(properties);
  }

  public start(currentDate: Date, functionExecutionId?: string): void {
    this.ensureStatusIs(ProcessingJobStatus.Queued, 'Only queued jobs can be started.');

    this.properties.status = ProcessingJobStatus.Running;
    this.properties.progressPercentage = ProgressPercentage.create(0);
    this.properties.startedAt = currentDate;
    this.properties.updatedAt = currentDate;

    if (functionExecutionId !== undefined && functionExecutionId.trim().length > 0) {
      this.properties.functionExecutionId = functionExecutionId.trim();
    }
  }

  public reportProgress(progressPercentage: ProgressPercentage, currentDate: Date): void {
    this.ensureStatusIs(ProcessingJobStatus.Running, 'Only running jobs can report progress.');

    if (!progressPercentage.isGreaterThan(this.properties.progressPercentage)) {
      throw new DomainRuleViolationError('Processing progress cannot move backwards or stay unchanged.');
    }

    if (progressPercentage.value >= 100) {
      throw new DomainRuleViolationError('Use complete() to finish a processing job.');
    }

    this.properties.progressPercentage = progressPercentage;
    this.properties.updatedAt = currentDate;
  }

  public complete(currentDate: Date): void {
    this.ensureStatusIs(ProcessingJobStatus.Running, 'Only running jobs can be completed.');

    this.properties.status = ProcessingJobStatus.Completed;
    this.properties.progressPercentage = ProgressPercentage.create(100);
    this.properties.completedAt = currentDate;
    this.properties.updatedAt = currentDate;
  }

  public fail(failureReason: string, currentDate: Date): void {
    if (
      this.properties.status !== ProcessingJobStatus.Queued &&
      this.properties.status !== ProcessingJobStatus.Running
    ) {
      throw new DomainRuleViolationError('Only queued or running jobs can fail.');
    }

    const normalizedFailureReason = failureReason.trim();

    if (normalizedFailureReason.length === 0) {
      throw new DomainRuleViolationError('Failure reason cannot be empty.');
    }

    this.properties.status = ProcessingJobStatus.Failed;
    this.properties.failureReason = normalizedFailureReason;
    this.properties.completedAt = currentDate;
    this.properties.updatedAt = currentDate;
  }

  public get id(): ProcessingJobId {
    return this.properties.id;
  }

  public get imageAssetId(): ImageAssetId {
    return this.properties.imageAssetId;
  }

  public get status(): ProcessingJobStatus {
    return this.properties.status;
  }

  public get progressPercentage(): ProgressPercentage {
    return this.properties.progressPercentage;
  }

  public get failureReason(): string | undefined {
    return this.properties.failureReason;
  }

  public get functionExecutionId(): string | undefined {
    return this.properties.functionExecutionId;
  }

  public get startedAt(): Date | undefined {
    return this.properties.startedAt === undefined ? undefined : new Date(this.properties.startedAt);
  }

  public get completedAt(): Date | undefined {
    return this.properties.completedAt === undefined
      ? undefined
      : new Date(this.properties.completedAt);
  }

  public get createdAt(): Date {
    return new Date(this.properties.createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this.properties.updatedAt);
  }

  private ensureStatusIs(expectedStatus: ProcessingJobStatus, failureMessage: string): void {
    if (this.properties.status !== expectedStatus) {
      throw new DomainRuleViolationError(failureMessage);
    }
  }
}
