import type { CodecResult } from '../codecs/CodecResult';
import { convertTiddlerBody } from './convertTiddlerBody';
import { getTiddlerProperties } from '../metadata/getTiddlerProperties';
import { findPreservationRecord } from '../preservation/metadata/findPreservationRecord';
import { getPreservationKey } from '../preservation/metadata/getPreservationKey';
import { isMarkdownContentType } from './isMarkdownContentType';
import type { MarkdownNote } from './MarkdownNote';
import { normalizeObsidianTags } from '../metadata/normalizeObsidianTags';
import { parseObsidianFrontMatter } from '../codecs/obsidian/parseObsidianFrontMatter';
import { parseTiddlyWikiJson } from '../codecs/tiddlywiki/parseTiddlyWikiJson';
import { parseTiddlyWikiTags } from '../metadata/parseTiddlyWikiTags';
import { PRESERVATION_FIELD } from '../preservation/metadata/PreservationField.const';
import { PRESERVATION_PROPERTY } from '../preservation/metadata/PreservationProperty.const';
import type { PreservationRecord } from '../preservation/metadata/PreservationRecord';
import { restoreNoteFromTiddler } from '../preservation/metadata/restoreNoteFromTiddler';
import { serializeObsidianFrontMatter } from '../codecs/obsidian/serializeObsidianFrontMatter';
import type { TiddlerFields } from '../codecs/tiddlywiki/TiddlerFields';

export function importTiddler(
  tiddler: TiddlerFields,
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
    );
  }

  const sourceProperties = getTiddlerProperties(normalizedTiddler);

  const properties: Record<string, unknown> = Object.create(null);
  let sourceFrontMatter = '';
  let body = normalizedTiddler.text;
  const diagnostics = [];

  if (isMarkdownContentType(normalizedTiddler.type)) {
    const parsed = parseObsidianFrontMatter(body);

    diagnostics.push(...parsed.diagnostics);

    if (!parsed.value) {
      return { diagnostics };
    }

    sourceFrontMatter = parsed.value.rawFrontMatter;
    body = parsed.value.body;

    for (const [name, value] of Object.entries(parsed.value.properties)) {
      properties[name] = value;
    }
  }

  for (const [name, value] of Object.entries(sourceProperties)) {
    const isReserved = ['title', 'type', 'tags'].includes(name);

    if (!isReserved) {
      properties[name] = value;
    }
  }

  const originalTags = normalizeObsidianTags(
    parseTiddlyWikiTags(normalizedTiddler.tags ?? ''),
  );

  if (normalizedTiddler.tags !== undefined) {
    properties.tags = Object.keys(originalTags);
  }

  const converted = convertTiddlerBody(body, normalizedTiddler.type, true);

  diagnostics.push(...converted.diagnostics);

  const record: PreservationRecord = {
    kind: 'obsidian-tiddlywiki-preservation',
    version: 1,
    origin: 'tiddlywiki',
    identity: normalizedTiddler.title,
    sourceBody: normalizedTiddler.text,
    targetBody: converted.text,
    sourceProperties,
    targetProperties: Object.fromEntries(Object.entries(properties)),
    sourceFrontMatter,
    originalTags,
  };

  properties[getPreservationKey(properties, PRESERVATION_PROPERTY)] = record;

  return {
    value: {
      title: normalizedTiddler.title,
      content: serializeObsidianFrontMatter(properties, converted.text),
    },
    diagnostics,
  };
}
