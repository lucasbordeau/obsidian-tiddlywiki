import { convertText } from '../../conversion/convertText';
import type { CodecResult } from '../../codecs/results/CodecResult';
import { collectObsidianTags } from '../../metadata/tags/obsidian/extraction/collectObsidianTags';
import { createCodecDiagnostic } from '../../codecs/diagnostics/createCodecDiagnostic';
import { encodeMetadataField } from '../../metadata/fields/encoding/encodeMetadataField';
import { formatTiddlyWikiTimestamp } from '../../metadata/timestamps/tiddlywiki/formatTiddlyWikiTimestamp';
import { findPreservationRecord } from '../../preservation/metadata/records/findPreservationRecord';
import { getPreservationKey } from '../../preservation/metadata/keys/getPreservationKey';
import { getTiddlerProperties } from '../../metadata/fields/tiddlywiki/getTiddlerProperties';
import type { MarkdownNote } from '../types/MarkdownNote';
import { parseObsidianFrontMatter } from '../../codecs/obsidian/frontmatter/parsing/parseObsidianFrontMatter';
import { PRESERVATION_FIELD } from '../../preservation/metadata/constants/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../../preservation/metadata/constants/PreservationProperty.const';
import type { PreservationRecord } from '../../preservation/metadata/types/PreservationRecord';
import { readObsidianTags } from '../../metadata/tags/obsidian/reading/readObsidianTags';
import { restoreTiddlerFromNote } from '../../preservation/metadata/restoration/tiddlywiki/restoreTiddlerFromNote';
import { serializeTiddlyWikiTags } from '../../metadata/tags/tiddlywiki/serialization/serializeTiddlyWikiTags';
import type { TiddlerFields } from '../../codecs/tiddlywiki/fields/types/TiddlerFields';

export function exportObsidianNote(
  note: MarkdownNote,
): CodecResult<TiddlerFields> {
  if (note.title.trim().length === 0) {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'missing-tiddler-title',
          'The note needs a nonempty title.',
          note.content.length,
        ),
      ],
    };
  }

  const parsed = parseObsidianFrontMatter(note.content);

  if (!parsed.value) {
    return { diagnostics: parsed.diagnostics };
  }

  const document = parsed.value;

  const previous = findPreservationRecord(
    document.properties,
    PRESERVATION_PROPERTY,
    'tiddlywiki',
  );

  if (previous) {
    return restoreTiddlerFromNote(
      note.title,
      document,
      previous.record,
      previous.key,
    );
  }

  const converted = convertText(document.body, 'obsidian', 'tiddlywiki');

  const fields: TiddlerFields = Object.create(null);

  fields.title = note.title;
  fields.text = converted.text;
  fields.type = 'text/vnd.tiddlywiki';

  for (const [name, value] of Object.entries(document.properties)) {
    const isReserved = ['title', 'text', 'type', 'tags'].includes(name);

    if (!isReserved) {
      const encoded = encodeMetadataField(value);

      fields[name] =
        name === 'created' || name === 'modified'
          ? formatTiddlyWikiTimestamp(encoded)
          : encoded;
    }
  }

  const propertyTags = readObsidianTags(document.properties.tags);
  const bodyTags = collectObsidianTags(converted.document);
  const tags = [...new Set([...propertyTags, ...bodyTags])];

  const hasTags =
    tags.length > 0 ||
    Object.prototype.hasOwnProperty.call(document.properties, 'tags');

  if (hasTags) {
    fields.tags = serializeTiddlyWikiTags(tags);
  }

  const record: PreservationRecord = {
    kind: 'obsidian-tiddlywiki-preservation',
    version: 1,
    origin: 'obsidian',
    identity: note.title,
    sourceBody: document.body,
    targetBody: converted.text,
    sourceProperties: document.properties,
    targetProperties: getTiddlerProperties(fields),
    sourceFrontMatter: document.rawFrontMatter,
    originalTags: {},
  };

  fields[getPreservationKey(fields, PRESERVATION_FIELD)] =
    JSON.stringify(record);

  return {
    value: fields,
    diagnostics: [...parsed.diagnostics, ...converted.diagnostics],
  };
}
