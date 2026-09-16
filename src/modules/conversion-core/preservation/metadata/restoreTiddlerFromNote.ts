import { applyNotePropertyEdits } from '@/modules/conversion-core/preservation/metadata/applyNotePropertyEdits';
import { restoreNativeMarkdownFrontMatter } from '@/modules/conversion-core/preservation/metadata/restoreNativeMarkdownFrontMatter';
import { areMetadataValuesEqual } from '@/modules/conversion-core/preservation/metadata/areMetadataValuesEqual';
import { CodecResult } from '@/modules/conversion-core/codecs/CodecResult';
import { convertTiddlerBody } from '@/modules/conversion-core/notes/convertTiddlerBody';
import { createCodecDiagnostic } from '@/modules/conversion-core/codecs/createCodecDiagnostic';

import { FrontMatterDocument } from '@/modules/conversion-core/codecs/obsidian/FrontMatterDocument';
import { getTiddlerProperties } from '@/modules/conversion-core/metadata/getTiddlerProperties';
import { getPreservationKey } from '@/modules/conversion-core/preservation/metadata/getPreservationKey';

import { PRESERVATION_FIELD } from '@/modules/conversion-core/preservation/metadata/PreservationField.const';
import { PreservationRecord } from '@/modules/conversion-core/preservation/metadata/PreservationRecord';

import { serializeObsidianFrontMatter } from '@/modules/conversion-core/codecs/obsidian/serializeObsidianFrontMatter';

import { TiddlerFields } from '@/modules/conversion-core/codecs/tiddlywiki/TiddlerFields';

export function restoreTiddlerFromNote(
  title: string,
  document: FrontMatterDocument,
  record: PreservationRecord,
  preservationKey: string | undefined,
): CodecResult<TiddlerFields> {
  const sourceEntries = Object.entries(record.sourceProperties);

  const hasStringFields = sourceEntries.every(
    ([, value]) => typeof value === 'string',
  );

  if (!hasStringFields) {
    return {
      diagnostics: [
        createCodecDiagnostic(
          'invalid-preservation-fields',
          'Preserved TiddlyWiki fields must be strings.',
          document.body.length,
        ),
      ],
    };
  }

  const fields = Object.fromEntries(sourceEntries) as TiddlerFields;

  fields.title = title;

  const currentEntries = Object.entries(document.properties).filter(
    ([name]) => preservationKey === undefined || name !== preservationKey,
  );

  const currentProperties = Object.fromEntries(currentEntries);

  applyNotePropertyEdits(fields, currentProperties, record);

  fields.title = title;

  const sameIdentity = title === record.identity;
  const sameContentType = fields.type === record.sourceProperties.type;
  const sameBody = document.body === record.targetBody;

  const sameProperties = areMetadataValuesEqual(
    currentProperties,
    record.targetProperties,
  );

  const bodyConversion = convertTiddlerBody(document.body, fields.type, false);
  const diagnostics = [];
  const canRestoreBody = sameIdentity && sameContentType && sameBody;

  fields.text = canRestoreBody ? record.sourceBody : bodyConversion.text;

  if (!canRestoreBody) {
    diagnostics.push(...bodyConversion.diagnostics);
  }

  if (!sameIdentity) {
    diagnostics.push(
      createCodecDiagnostic(
        'preservation-identity-changed',
        'The note identity changed; its current body was converted.',
        document.body.length,
        'warning',
      ),
    );
  }

  restoreNativeMarkdownFrontMatter(fields, document, record, currentProperties);

  const hasEdits = !sameIdentity || !sameBody || !sameProperties;

  if (hasEdits) {
    const nextRecord: PreservationRecord = {
      kind: 'obsidian-tiddlywiki-preservation',
      version: 1,
      origin: 'obsidian',
      identity: title,
      sourceBody: document.body,
      targetBody: fields.text,
      sourceProperties: currentProperties,
      targetProperties: getTiddlerProperties(fields),
      sourceFrontMatter: serializeObsidianFrontMatter(currentProperties, ''),
      originalTags: {},
    };

    fields[getPreservationKey(fields, PRESERVATION_FIELD)] =
      JSON.stringify(nextRecord);
  }

  return { value: fields, diagnostics };
}
