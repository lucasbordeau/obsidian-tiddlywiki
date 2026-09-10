import { applyNotePropertyEdits } from './fields/applyNotePropertyEdits';
import { restoreNativeMarkdownFrontMatter } from './frontmatter/restoreNativeMarkdownFrontMatter';
import { areMetadataValuesEqual } from '../../comparison/areMetadataValuesEqual';
import type { CodecResult } from '../../../../codecs/results/CodecResult';
import { convertTiddlerBody } from '../../../../notes/content/conversion/convertTiddlerBody';
import { createCodecDiagnostic } from '../../../../codecs/diagnostics/createCodecDiagnostic';

import type { FrontMatterDocument } from '../../../../codecs/obsidian/frontmatter/types/FrontMatterDocument';
import { getTiddlerProperties } from '../../../../metadata/fields/tiddlywiki/getTiddlerProperties';
import { getPreservationKey } from '../../keys/getPreservationKey';

import { PRESERVATION_FIELD } from '../../constants/PreservationField.const';
import type { PreservationRecord } from '../../types/PreservationRecord';

import { serializeObsidianFrontMatter } from '../../../../codecs/obsidian/frontmatter/serialization/serializeObsidianFrontMatter';

import type { TiddlerFields } from '../../../../codecs/tiddlywiki/fields/types/TiddlerFields';

export function restoreTiddlerFromNote(
  title: string,
  document: FrontMatterDocument,
  record: PreservationRecord,
  preservationKey: string,
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
    ([name]) => name !== preservationKey,
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

  const converted = convertTiddlerBody(document.body, fields.type, false);
  const diagnostics = [];
  const canRestoreBody = sameIdentity && sameContentType && sameBody;

  fields.text = canRestoreBody ? record.sourceBody : converted.text;

  if (!canRestoreBody) {
    diagnostics.push(...converted.diagnostics);
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
