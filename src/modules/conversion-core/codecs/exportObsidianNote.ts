import { convertText } from '../convertText';
import { CodecResult } from './CodecResult';
import { collectObsidianTags } from './collectObsidianTags';
import { createCodecDiagnostic } from './createCodecDiagnostic';
import { encodeMetadataField } from './encodeMetadataField';
import { formatTiddlyWikiTimestamp } from './formatTiddlyWikiTimestamp';
import { findPreservationRecord } from './findPreservationRecord';
import { getPreservationKey } from './getPreservationKey';
import { getTiddlerProperties } from './getTiddlerProperties';
import { MarkdownNote } from './MarkdownNote';
import { parseObsidianFrontMatter } from './parseObsidianFrontMatter';
import { PRESERVATION_FIELD } from './PreservationField.const';
import { PRESERVATION_PROPERTY } from './PreservationProperty.const';
import { PreservationRecord } from './PreservationRecord';
import { readObsidianTags } from './readObsidianTags';
import { restoreTiddlerFromNote } from './restoreTiddlerFromNote';
import { serializeTiddlyWikiTags } from './serializeTiddlyWikiTags';
import { TiddlerFields } from './TiddlerFields';

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
