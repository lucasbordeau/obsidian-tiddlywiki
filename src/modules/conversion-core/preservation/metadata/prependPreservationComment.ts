import { encodePreservationComment } from './encodePreservationComment';
import type { PreservationRecord } from './PreservationRecord';

export function prependPreservationComment(
  content: string,
  record: PreservationRecord,
): string {
  const separator = content.length > 0 ? '\n\n' : '';

  return `${encodePreservationComment(record)}${separator}${content}`;
}
