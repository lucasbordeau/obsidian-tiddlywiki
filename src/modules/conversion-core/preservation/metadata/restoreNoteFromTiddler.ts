import { applyTiddlerFieldEdits } from '@/modules/conversion-core/preservation/metadata/applyTiddlerFieldEdits';
import { prependPreservationComment } from '@/modules/conversion-core/preservation/metadata/prependPreservationComment';
import { areMetadataValuesEqual } from '@/modules/conversion-core/preservation/metadata/areMetadataValuesEqual';
import { CodecResult } from '@/modules/conversion-core/codecs/CodecResult';
import { convertTiddlerBody } from '@/modules/conversion-core/notes/convertTiddlerBody';
import { createCodecDiagnostic } from '@/modules/conversion-core/codecs/createCodecDiagnostic';

import { getTiddlerProperties } from '@/modules/conversion-core/metadata/getTiddlerProperties';
import { ImportTiddlerOptions } from '@/modules/conversion-core/notes/ImportTiddlerOptions';
import { MarkdownNote } from '@/modules/conversion-core/notes/MarkdownNote';
import { normalizeObsidianTags } from '@/modules/conversion-core/metadata/normalizeObsidianTags';
import { parseTiddlyWikiTags } from '@/modules/conversion-core/metadata/parseTiddlyWikiTags';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';
import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';
import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

export function restoreNoteFromTiddler(
  tiddler: TiddlerFields,
  record: PreservationRecord,
  preservationKey: string,
  options: ImportTiddlerOptions = {},
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

  const bodyConversion = convertTiddlerBody(
    tiddler.text,
    tiddler.type,
    true,
    options,
  );

  const body = canRestoreBody ? record.sourceBody : bodyConversion.text;
  const diagnostics = canRestoreBody ? [] : bodyConversion.diagnostics;

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
    const preserveRoundTripMetadata =
      options.preserveRoundTripMetadata !== false;

    let targetBody = body;

    if (preserveRoundTripMetadata) {
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

      targetBody = prependPreservationComment(body, nextRecord);
    }

    const content = serializeObsidianFrontMatter(properties, targetBody);

    return {
      value: {
        title: tiddler.title,
        content,
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
