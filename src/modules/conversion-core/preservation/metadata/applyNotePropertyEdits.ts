import { areMetadataValuesEqual } from '@/modules/conversion-core/preservation/metadata/areMetadataValuesEqual';
import { encodeMetadataField } from '@/modules/conversion-core/metadata/encodeMetadataField';
import { formatTiddlyWikiTimestamp } from '@/modules/conversion-core/metadata/formatTiddlyWikiTimestamp';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';
import { readObsidianTags } from '@/modules/conversion-core/metadata/readObsidianTags';
import { serializeTiddlyWikiTags } from '@/modules/conversion-core/metadata/serializeTiddlyWikiTags';
import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

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
