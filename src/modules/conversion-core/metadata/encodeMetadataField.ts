export function encodeMetadataField(value: unknown): string {
  return typeof value === 'string' ? value : (JSON.stringify(value) ?? '');
}
