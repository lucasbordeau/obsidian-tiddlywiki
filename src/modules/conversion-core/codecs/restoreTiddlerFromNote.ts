import { areMetadataValuesEqual } from './areMetadataValuesEqual';
import { CodecResult } from './CodecResult';
import { convertTiddlerBody } from './convertTiddlerBody';
import { createCodecDiagnostic } from './createCodecDiagnostic';
import { encodeMetadataField } from './encodeMetadataField';
import { formatTiddlyWikiTimestamp } from './formatTiddlyWikiTimestamp';
import { FrontMatterDocument } from './FrontMatterDocument';
import { getTiddlerProperties } from './getTiddlerProperties';
import { getPreservationKey } from './getPreservationKey';
import { isMarkdownContentType } from './isMarkdownContentType';
import { parseObsidianFrontMatter } from './parseObsidianFrontMatter';
import { PRESERVATION_FIELD } from './PreservationField.const';
import { PreservationRecord } from './PreservationRecord';
import { readObsidianTags } from './readObsidianTags';
import { serializeObsidianFrontMatter } from './serializeObsidianFrontMatter';
import { serializeTiddlyWikiTags } from './serializeTiddlyWikiTags';
import { TiddlerFields } from './TiddlerFields';

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
  const propertyNames = new Set([
    ...Object.keys(record.targetProperties),
    ...Object.keys(currentProperties),
  ]);
  for (const name of propertyNames) {
    const current = currentProperties[name];
    const isUnchanged = areMetadataValuesEqual(
      current,
      record.targetProperties[name],
    );
    if (isUnchanged) {
      continue;
    }
    if (current === undefined) {
      delete fields[name];
    } else if (name === 'tags') {
      const tags = readObsidianTags(current);
      const mappedTags = new Map(
        Object.entries(record.originalTags).map(([tag, original]) => [
          tag.toLowerCase(),
          original,
        ]),
      );
      const originalTags = tags.map(
        (tag) => mappedTags.get(tag.toLowerCase()) ?? tag,
      );
      fields.tags = serializeTiddlyWikiTags(originalTags);
    } else {
      const encoded = encodeMetadataField(current);
      Object.defineProperty(fields, name, {
        value:
          name === 'created' || name === 'modified'
            ? formatTiddlyWikiTimestamp(encoded)
            : encoded,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }
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
  const hasNativeFrontMatter =
    isMarkdownContentType(fields.type) && record.sourceFrontMatter.length > 0;
  if (hasNativeFrontMatter) {
    const nativeDocument = parseObsidianFrontMatter(record.sourceBody).value;
    if (nativeDocument) {
      const nativeProperties: Record<string, unknown> = Object.fromEntries(
        Object.entries(nativeDocument.properties),
      );
      for (const name of Object.keys(nativeDocument.properties)) {
        const wasEdited = !areMetadataValuesEqual(
          currentProperties[name],
          record.targetProperties[name],
        );
        if (wasEdited) {
          if (Object.prototype.hasOwnProperty.call(currentProperties, name)) {
            Object.defineProperty(nativeProperties, name, {
              value: currentProperties[name],
              enumerable: true,
              writable: true,
              configurable: true,
            });
          } else {
            delete nativeProperties[name];
          }
        }
      }
      const nativePropertiesUnchanged = areMetadataValuesEqual(
        nativeProperties,
        nativeDocument.properties,
      );
      fields.text = nativePropertiesUnchanged
        ? `${record.sourceFrontMatter}${document.body}`
        : serializeObsidianFrontMatter(nativeProperties, document.body);
    }
  }
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
