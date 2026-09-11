import { areMetadataValuesEqual } from './areMetadataValuesEqual';
import { encodeMetadataField } from '../../metadata/encodeMetadataField';
import { formatTiddlyWikiTimestamp } from '../../metadata/formatTiddlyWikiTimestamp';
import type { PreservationRecord } from './PreservationRecord';
import { readObsidianTags } from '../../metadata/readObsidianTags';
import { serializeTiddlyWikiTags } from '../../metadata/serializeTiddlyWikiTags';
import type { TiddlerFields } from '../../codecs/tiddlywiki/TiddlerFields';

export function applyNotePropertyEdits(
  fields: TiddlerFields,
  currentProperties: Record<string, unknown>,
  record: PreservationRecord,
): void {
  const propertyNames = new Set([
    ...Object.keys(record.targetProperties),
    ...Object.keys(currentProperties),
  ]);

  for (const name of propertyNames) {
    const current = currentProperties[name];

    const isUnchanged = areMetadataValuesEqual(
      current,
      record.targetProperties[name],
    );

    if (isUnchanged) {
      continue;
    }

    if (current === undefined) {
      delete fields[name];
    } else if (name === 'tags') {
      const tags = readObsidianTags(current);

      const mappedTags = new Map(
        Object.entries(record.originalTags).map(([tag, original]) => [
          tag.toLowerCase(),
          original,
        ]),
      );

      const originalTags = tags.map(
        (tag) => mappedTags.get(tag.toLowerCase()) ?? tag,
      );

      fields.tags = serializeTiddlyWikiTags(originalTags);
    } else {
      const encoded = encodeMetadataField(current);

      Object.defineProperty(fields, name, {
        value:
          name === 'created' || name === 'modified'
            ? formatTiddlyWikiTimestamp(encoded)
            : encoded,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }
}
