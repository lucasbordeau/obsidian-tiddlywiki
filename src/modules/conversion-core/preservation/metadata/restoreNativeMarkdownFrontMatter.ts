import { areMetadataValuesEqual } from './areMetadataValuesEqual';
import type { FrontMatterDocument } from '../../codecs/obsidian/FrontMatterDocument';
import { isMarkdownContentType } from '../../notes/isMarkdownContentType';
import { parseObsidianFrontMatter } from '../../codecs/obsidian/parseObsidianFrontMatter';
import type { PreservationRecord } from './PreservationRecord';
import { serializeObsidianFrontMatter } from '../../codecs/obsidian/serializeObsidianFrontMatter';
import type { TiddlerFields } from '../../codecs/tiddlywiki/TiddlerFields';

export function restoreNativeMarkdownFrontMatter(
  fields: TiddlerFields,
  document: FrontMatterDocument,
  record: PreservationRecord,
  currentProperties: Record<string, unknown>,
): void {
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
}
