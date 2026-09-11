import type { PreservedSource } from './PreservedSource';

export function encodePreservedSource(source: PreservedSource): string {
  const payload = encodeURIComponent(JSON.stringify(source)).replace(
    /-/g,
    '%2D',
  );

  return `<!--otw:v1:${payload}-->`;
}
