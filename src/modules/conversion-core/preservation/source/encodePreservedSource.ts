import { PreservedSource } from '@/modules/conversion-core/preservation/source/PreservedSource';

export function encodePreservedSource(source: PreservedSource): string {
  const payload = encodeURIComponent(JSON.stringify(source)).replace(
    /-/g,
    '%2D',
  );

  return `<!--otw:v1:${payload}-->`;
}
