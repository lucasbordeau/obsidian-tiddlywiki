export function getPreservationKey(
  properties: Record<string, unknown>,
  prefix: string,
): string {
  let key = prefix;
  let suffix = 1;
  while (Object.prototype.hasOwnProperty.call(properties, key)) {
    key = `${prefix}-${suffix++}`;
  }
  return key;
}
