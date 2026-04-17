import { DomainRuleViolationError } from '../errors/domain-rule-violation.error';

export interface ImageDimensionsProperties {
  widthInPixels: number;
  heightInPixels: number;
}

export class ImageDimensions {
  private constructor(private readonly properties: ImageDimensionsProperties) {}

  public static create(properties: ImageDimensionsProperties): ImageDimensions {
    if (!Number.isInteger(properties.widthInPixels) || properties.widthInPixels <= 0) {
      throw new DomainRuleViolationError('Image width must be a positive integer.');
    }

    if (!Number.isInteger(properties.heightInPixels) || properties.heightInPixels <= 0) {
      throw new DomainRuleViolationError('Image height must be a positive integer.');
    }

    return new ImageDimensions(properties);
  }

  public get widthInPixels(): number {
    return this.properties.widthInPixels;
  }

  public get heightInPixels(): number {
    return this.properties.heightInPixels;
  }
}
