import { areMetadataValuesEqual } from './areMetadataValuesEqual';
import { decodeMetadataField } from '../../metadata/decodeMetadataField';
import { normalizeObsidianTags } from '../../metadata/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '../../metadata/parseTiddlyWikiTags';
import type { PreservationRecord } from './PreservationRecord';

export function applyTiddlerFieldEdits(
  properties: Record<string, unknown>,
  currentFields: Record<string, string>,
  record: PreservationRecord,
): void {
  const propertyNames = new Set([
    ...Object.keys(record.targetProperties),
    ...Object.keys(currentFields),
  ]);

  for (const name of propertyNames) {
    const isReserved = name === 'title' || name === 'type';
    const current = currentFields[name];

    const unchanged = areMetadataValuesEqual(
      current,
      record.targetProperties[name],
    );

    if (isReserved || unchanged) {
      continue;
    }

    if (current === undefined) {
      delete properties[name];
    } else if (name === 'tags') {
      properties.tags = Object.keys(
        normalizeObsidianTags(parseTiddlyWikiTags(current)),
      );
    } else {
      Object.defineProperty(properties, name, {
        value: decodeMetadataField(current, record.sourceProperties[name]),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }
}
