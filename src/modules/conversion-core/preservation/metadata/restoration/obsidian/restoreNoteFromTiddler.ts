import { applyTiddlerFieldEdits } from './properties/applyTiddlerFieldEdits';
import { areMetadataValuesEqual } from '../../comparison/areMetadataValuesEqual';
import type { CodecResult } from '../../../../codecs/results/CodecResult';
import { convertTiddlerBody } from '../../../../notes/content/conversion/convertTiddlerBody';
import { createCodecDiagnostic } from '../../../../codecs/diagnostics/createCodecDiagnostic';

import { getTiddlerProperties } from '../../../../metadata/fields/tiddlywiki/getTiddlerProperties';
import { getPreservationKey } from '../../keys/getPreservationKey';
import type { MarkdownNote } from '../../../../notes/types/MarkdownNote';
import { normalizeObsidianTags } from '../../../../metadata/tags/obsidian/normalization/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '../../../../metadata/tags/tiddlywiki/parsing/parseTiddlyWikiTags';
import { PRESERVATION_PROPERTY } from '../../constants/PreservationProperty.const';
import type { PreservationRecord } from '../../types/PreservationRecord';
import { serializeObsidianFrontMatter } from '../../../../codecs/obsidian/frontmatter/serialization/serializeObsidianFrontMatter';
import type { TiddlerFields } from '../../../../codecs/tiddlywiki/fields/types/TiddlerFields';

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

  applyTiddlerFieldEdits(properties, currentFields, record);

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
