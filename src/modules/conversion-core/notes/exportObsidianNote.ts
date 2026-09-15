import { convertText } from '../conversion/convertText';
import type { CodecResult } from '../codecs/CodecResult';
import { collectObsidianTags } from '../metadata/collectObsidianTags';
import { createCodecDiagnostic } from '../codecs/createCodecDiagnostic';
import { encodeMetadataField } from '../metadata/encodeMetadataField';
import { extractPreservationComment } from '../preservation/metadata/extractPreservationComment';
import { formatTiddlyWikiTimestamp } from '../metadata/formatTiddlyWikiTimestamp';
import { findPreservationRecord } from '../preservation/metadata/findPreservationRecord';
import { getPreservationKey } from '../preservation/metadata/getPreservationKey';
import { getTiddlerProperties } from '../metadata/getTiddlerProperties';
import type { MarkdownNote } from './MarkdownNote';
import { parseObsidianFrontMatter } from '../codecs/obsidian/parseObsidianFrontMatter';
import { PRESERVATION_FIELD } from '../preservation/metadata/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../preservation/metadata/PreservationProperty.const';
import type { PreservationRecord } from '../preservation/metadata/PreservationRecord';
import { readObsidianTags } from '../metadata/readObsidianTags';
import { restoreTiddlerFromNote } from '../preservation/metadata/restoreTiddlerFromNote';
import { serializeTiddlyWikiTags } from '../metadata/serializeTiddlyWikiTags';
import type { TiddlerFields } from '../codecs/tiddlywiki/TiddlerFields';

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
  const preservedBody = extractPreservationComment(document.body);
  const documentWithoutComment = { ...document, body: preservedBody.body };

  const legacyRecord = findPreservationRecord(
    document.properties,
    PRESERVATION_PROPERTY,
    'tiddlywiki',
  );

  const previous = preservedBody.record
    ? { record: preservedBody.record, key: undefined }
    : legacyRecord;

  if (previous) {
    return restoreTiddlerFromNote(
      note.title,
      documentWithoutComment,
      previous.record,
      previous.key,
    );
  }

  const converted = convertText(
    documentWithoutComment.body,
    'obsidian',
    'tiddlywiki',
  );

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
