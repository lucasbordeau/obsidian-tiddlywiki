export function decodeMetadataField(
  value: string,
  originalValue: unknown,
): unknown {
  if (typeof originalValue === 'string' || originalValue === undefined) {
    return value;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}
