import { areMetadataValuesEqual } from './areMetadataValuesEqual';
import { CodecResult } from './CodecResult';
import { convertTiddlerBody } from './convertTiddlerBody';
import { createCodecDiagnostic } from './createCodecDiagnostic';
import { decodeMetadataField } from './decodeMetadataField';
import { getTiddlerProperties } from './getTiddlerProperties';
import { getPreservationKey } from './getPreservationKey';
import { MarkdownNote } from './MarkdownNote';
import { normalizeObsidianTags } from './normalizeObsidianTags';
import { parseTiddlyWikiTags } from './parseTiddlyWikiTags';
import { PRESERVATION_PROPERTY } from './PreservationProperty.const';
import { PreservationRecord } from './PreservationRecord';
import { serializeObsidianFrontMatter } from './serializeObsidianFrontMatter';
import { TiddlerFields } from './TiddlerFields';

export function restoreNoteFromTiddler(
  tiddler: TiddlerFields,
  record: PreservationRecord,
  preservationKey: string,
): CodecResult<MarkdownNote> {
  const properties = Object.fromEntries(
    Object.entries(record.sourceProperties),
  );
  const currentFields = getTiddlerProperties(tiddler);
  delete currentFields[preservationKey];
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
  const sameIdentity = tiddler.title === record.identity;
  const sameContentType = tiddler.type === record.targetProperties.type;
  const sameBody = tiddler.text === record.targetBody;
  const sameFields = areMetadataValuesEqual(
    currentFields,
    record.targetProperties,
  );
  const canRestoreBody = sameIdentity && sameContentType && sameBody;
  const converted = convertTiddlerBody(tiddler.text, tiddler.type, true);
  const body = canRestoreBody ? record.sourceBody : converted.text;
  const diagnostics = canRestoreBody ? [] : converted.diagnostics;
  if (!sameIdentity) {
    diagnostics.push(
      createCodecDiagnostic(
        'preservation-identity-changed',
        'The tiddler identity changed; its current body was converted.',
        tiddler.text.length,
        'warning',
      ),
    );
  }
  const hasEdits = !sameIdentity || !sameBody || !sameFields;
  if (hasEdits) {
    const originalTags = normalizeObsidianTags(
      parseTiddlyWikiTags(tiddler.tags ?? ''),
    );
    const nextRecord: PreservationRecord = {
      kind: 'obsidian-tiddlywiki-preservation',
      version: 1,
      origin: 'tiddlywiki',
      identity: tiddler.title,
      sourceBody: tiddler.text,
      targetBody: body,
      sourceProperties: currentFields,
      targetProperties: Object.fromEntries(Object.entries(properties)),
      sourceFrontMatter: '',
      originalTags,
    };
    properties[getPreservationKey(properties, PRESERVATION_PROPERTY)] =
      nextRecord;
    return {
      value: {
        title: tiddler.title,
        content: serializeObsidianFrontMatter(properties, body),
      },
      diagnostics,
    };
  }
  return {
    value: {
      title: tiddler.title,
      content: `${record.sourceFrontMatter}${body}`,
    },
    diagnostics,
  };
}
