import { CodecResult } from '@/modules/conversion-core/codecs/CodecResult';
import { convertTiddlerBody } from '@/modules/conversion-core/notes/convertTiddlerBody';
import { prependPreservationComment } from '@/modules/conversion-core/preservation/metadata/prependPreservationComment';
import { getTiddlerProperties } from '@/modules/conversion-core/metadata/getTiddlerProperties';
import { isTiddlyWikiOperationalField } from '@/modules/conversion-core/metadata/isTiddlyWikiOperationalField';
import { parseTiddlyWikiTimestampToEpochMilliseconds } from '@/modules/conversion-core/metadata/parseTiddlyWikiTimestampToEpochMilliseconds';
import { findPreservationRecord } from '@/modules/conversion-core/preservation/metadata/findPreservationRecord';
import { ImportTiddlerOptions } from '@/modules/conversion-core/notes/ImportTiddlerOptions';
import { isMarkdownContentType } from '@/modules/conversion-core/notes/isMarkdownContentType';
import { MarkdownNote } from '@/modules/conversion-core/notes/MarkdownNote';
import { normalizeObsidianTags } from '@/modules/conversion-core/metadata/normalizeObsidianTags';
import { parseObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/parseObsidianFrontMatter';
import { parseTiddlyWikiJson } from '@/modules/conversion-core/codecs/tiddlywiki/parseTiddlyWikiJson';
import { parseTiddlyWikiTags } from '@/modules/conversion-core/metadata/parseTiddlyWikiTags';
import { PRESERVATION_FIELD } from '@/modules/conversion-core/preservation/metadata/PreservationField.const';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';
import { restoreNoteFromTiddler } from '@/modules/conversion-core/preservation/metadata/restoreNoteFromTiddler';
import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

export function importTiddler(
  tiddler: TiddlerFields,
  options: ImportTiddlerOptions = {},
): CodecResult<MarkdownNote> {
  const validation = parseTiddlyWikiJson(JSON.stringify([tiddler]));

  if (!validation.value) {
    return { diagnostics: validation.diagnostics };
  }

  const normalizedTiddler = validation.value[0];

  const previous = findPreservationRecord(
    normalizedTiddler,
    PRESERVATION_FIELD,
    'obsidian',
  );

  if (previous) {
    return restoreNoteFromTiddler(
      normalizedTiddler,
      previous.record,
      previous.key,
      options,
    );
  }

  const sourceProperties = getTiddlerProperties(normalizedTiddler);

  const properties: Record<string, unknown> = Object.create(null);
  let sourceFrontMatter = '';
  let body = normalizedTiddler.text;
  const diagnostics = [];

  if (isMarkdownContentType(normalizedTiddler.type)) {
    const frontMatterResult = parseObsidianFrontMatter(body);

    diagnostics.push(...frontMatterResult.diagnostics);

    if (!frontMatterResult.value) {
      return { diagnostics };
    }

    sourceFrontMatter = frontMatterResult.value.rawFrontMatter;
    body = frontMatterResult.value.body;

    for (const [name, value] of Object.entries(
      frontMatterResult.value.properties,
    )) {
      properties[name] = value;
    }
  }

  for (const [name, value] of Object.entries(sourceProperties)) {
    const isReserved = ['title', 'type', 'tags'].includes(name);

    const isOperationalField =
      options.metadataProjection === 'migration' &&
      isTiddlyWikiOperationalField(name);

    if (isReserved || isOperationalField) {
      continue;
    }

    const isTimestamp = name === 'created' || name === 'modified';

    const isFileTimestamp =
      options.metadataProjection === 'migration' &&
      isTimestamp &&
      parseTiddlyWikiTimestampToEpochMilliseconds(value) !== undefined;

    if (isFileTimestamp) {
      continue;
    }

    properties[name] = value;
  }

  const originalTags = normalizeObsidianTags(
    parseTiddlyWikiTags(normalizedTiddler.tags ?? ''),
  );

  if (normalizedTiddler.tags !== undefined) {
    properties.tags = Object.keys(originalTags);
  }

  const bodyConversion = convertTiddlerBody(
    body,
    normalizedTiddler.type,
    true,
    options,
  );

  diagnostics.push(...bodyConversion.diagnostics);

  const preserveRoundTripMetadata = options.preserveRoundTripMetadata !== false;
  let targetBody = bodyConversion.text;

  if (preserveRoundTripMetadata) {
    const record: PreservationRecord = {
      kind: 'obsidian-tiddlywiki-preservation',
      version: 1,
      origin: 'tiddlywiki',
      identity: normalizedTiddler.title,
      sourceBody: normalizedTiddler.text,
      targetBody: bodyConversion.text,
      sourceProperties,
      targetProperties: Object.fromEntries(Object.entries(properties)),
      sourceFrontMatter,
      originalTags,
    };

    targetBody = prependPreservationComment(bodyConversion.text, record);
  }

  const content = serializeObsidianFrontMatter(properties, targetBody);

  return {
    value: {
      title: normalizedTiddler.title,
      content,
    },
    diagnostics,
  };
}
