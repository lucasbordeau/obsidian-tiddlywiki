import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';

export function encodePreservationComment(record: PreservationRecord): string {
  const payload = encodeURIComponent(JSON.stringify(record)).replace(
    /-/g,
    '%2D',
  );

  return `<!--otw-meta:v1:${payload}-->`;
}
