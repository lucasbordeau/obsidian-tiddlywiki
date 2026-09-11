import { isRecord } from '../../validation/isRecord';

export function areMetadataValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }

  const areArrays = Array.isArray(left) && Array.isArray(right);

  if (areArrays) {
    const haveEqualElements =
      left.length === right.length &&
      left.every((value, index) => areMetadataValuesEqual(value, right[index]));

    return haveEqualElements;
  }

  const areMappings = isRecord(left) && isRecord(right);

  if (areMappings) {
    const leftKeys = Object.keys(left);

    const haveEqualProperties =
      leftKeys.length === Object.keys(right).length &&
      leftKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(right, key) &&
          areMetadataValuesEqual(left[key], right[key]),
      );

    return haveEqualProperties;
  }

  return false;
}
