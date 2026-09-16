import { encodePreservationComment } from '@/modules/conversion-core/preservation/metadata/encodePreservationComment';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';

export function prependPreservationComment(
  content: string,
  record: PreservationRecord,
): string {
  const separator = content.length > 0 ? '\n\n' : '';

  return `${encodePreservationComment(record)}${separator}${content}`;
}
