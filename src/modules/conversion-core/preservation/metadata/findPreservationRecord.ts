import { Dialect } from '@/modules/conversion-core/model/Dialect';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';
import { readPreservationRecord } from '@/modules/conversion-core/preservation/metadata/readPreservationRecord';

export function findPreservationRecord(
  properties: Record<string, unknown>,
  prefix: string,
  origin: Dialect,
): { key: string; record: PreservationRecord } | undefined {
  for (const [key, value] of Object.entries(properties)) {
    const matchesNamespace =
      key === prefix ||
      (key.startsWith(`${prefix}-`) &&
        /^\d+$/.test(key.slice(prefix.length + 1)));

    if (!matchesNamespace) {
      continue;
    }

    const record = readPreservationRecord(value);

    if (record?.origin === origin) {
      return { key, record };
    }
  }

  return undefined;
}
