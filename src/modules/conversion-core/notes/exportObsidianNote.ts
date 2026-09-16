import { Temporal } from '@js-temporal/polyfill';
import { convertText } from '@/modules/conversion-core/conversion/convertText';
import { CodecResult } from '@/modules/conversion-core/codecs/CodecResult';
import { collectObsidianTags } from '@/modules/conversion-core/metadata/collectObsidianTags';
import { createCodecDiagnostic } from '@/modules/conversion-core/codecs/createCodecDiagnostic';
import { encodeMetadataField } from '@/modules/conversion-core/metadata/encodeMetadataField';
import { ExportObsidianNoteOptions } from '@/modules/conversion-core/notes/ExportObsidianNoteOptions';
import { extractPreservationComment } from '@/modules/conversion-core/preservation/metadata/extractPreservationComment';
import { formatTiddlyWikiTimestamp } from '@/modules/conversion-core/metadata/formatTiddlyWikiTimestamp';
import { findPreservationRecord } from '@/modules/conversion-core/preservation/metadata/findPreservationRecord';
import { getPreservationKey } from '@/modules/conversion-core/preservation/metadata/getPreservationKey';
import { getTiddlerProperties } from '@/modules/conversion-core/metadata/getTiddlerProperties';
import { MarkdownNote } from '@/modules/conversion-core/notes/MarkdownNote';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { PRESERVATION_FIELD } from '@/modules/conversion-core/preservation/metadata/PreservationField.const';
import { PRESERVATION_PROPERTY } from '@/modules/conversion-core/preservation/metadata/PreservationProperty.const';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';
import { readObsidianTags } from '@/modules/conversion-core/metadata/readObsidianTags';
import { restoreTiddlerFromNote } from '@/modules/conversion-core/preservation/metadata/restoreTiddlerFromNote';
import { serializeTiddlyWikiTags } from '@/modules/conversion-core/metadata/serializeTiddlyWikiTags';
import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

function formatFileTimeForTiddlyWiki(
  timestampMs: number | undefined,
): string | undefined {
  if (timestampMs === undefined || !Number.isFinite(timestampMs)) {
    return undefined;
  }

  try {
    const instant = Temporal.Instant.fromEpochMilliseconds(
      Math.trunc(timestampMs),
    );

    const timestamp = formatTiddlyWikiTimestamp(
      instant.toString({ smallestUnit: 'millisecond' }),
    );

    return /^\d{17}$/.test(timestamp) ? timestamp : undefined;
  } catch {
    return undefined;
  }
}

export function exportObsidianNote(
  note: MarkdownNote,
  options: ExportObsidianNoteOptions = {},
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

  const frontMatterResult = parseObsidianFrontMatter(note.content);

  if (!frontMatterResult.value) {
    return { diagnostics: frontMatterResult.diagnostics };
  }

  const document = frontMatterResult.value;
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

  const bodyConversion = convertText(
    documentWithoutComment.body,
    'obsidian',
    'tiddlywiki',
  );

  const fields: TiddlerFields = Object.create(null);

  fields.title = note.title;
  fields.text = bodyConversion.text;
  fields.type = 'text/vnd.tiddlywiki';

  for (const [name, value] of Object.entries(document.properties)) {
    const isReserved = ['title', 'text', 'type', 'tags'].includes(name);

    if (!isReserved) {
      const encoded = encodeMetadataField(value);

      fields[name] =
        name === 'created' || name === 'modified'
          ? formatTiddlyWikiTimestamp(
              encoded,
              options.assumeUtcForNaiveDateTime,
            )
          : encoded;
    }
  }

  const hasCreatedProperty = Object.prototype.hasOwnProperty.call(
    document.properties,
    'created',
  );

  const hasModifiedProperty = Object.prototype.hasOwnProperty.call(
    document.properties,
    'modified',
  );

  const fileCreatedTimestamp = hasCreatedProperty
    ? undefined
    : formatFileTimeForTiddlyWiki(options.creationTimeMs);

  const fileModifiedTimestamp = hasModifiedProperty
    ? undefined
    : formatFileTimeForTiddlyWiki(options.modificationTimeMs);

  if (fileCreatedTimestamp !== undefined) {
    fields.created = fileCreatedTimestamp;
  }

  if (fileModifiedTimestamp !== undefined) {
    fields.modified = fileModifiedTimestamp;
  }

  const propertyTags = readObsidianTags(document.properties.tags);
  const bodyTags = collectObsidianTags(bodyConversion.document);
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
    targetBody: bodyConversion.text,
    sourceProperties: document.properties,
    targetProperties: getTiddlerProperties(fields),
    sourceFrontMatter: document.rawFrontMatter,
    originalTags: {},
  };

  fields[getPreservationKey(fields, PRESERVATION_FIELD)] =
    JSON.stringify(record);

  return {
    value: fields,
    diagnostics: [
      ...frontMatterResult.diagnostics,
      ...bodyConversion.diagnostics,
    ],
  };
}
