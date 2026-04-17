import { UniqueIdentifier } from '../../shared/value-objects/unique-identifier.value-object';

export class ImageAssetId extends UniqueIdentifier {
  private constructor(rawImageAssetId: string) {
    super(rawImageAssetId, 'ImageAssetId');
  }

  public static create(rawImageAssetId: string): ImageAssetId {
    return new ImageAssetId(rawImageAssetId);
  }
}
