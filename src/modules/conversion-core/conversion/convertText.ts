import { parseObsidian } from '@/modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '@/modules/conversion-core/syntax/obsidian/serialization/serializeObsidian';
import { parseTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { ConversionResult } from '@/modules/conversion-core/conversion/ConversionResult';
import { Dialect } from '@/modules/conversion-core/model/Dialect';

export function convertText(
  source: string,
  from: Dialect,
  to: Dialect,
  options: ConversionOptions = {},
): ConversionResult {
  const document =
    from === 'obsidian' ? parseObsidian(source) : parseTiddlyWiki(source);

  if (from === to && !options.resolveLink) {
    return { text: source, document, diagnostics: document.diagnostics };
  }

  const serialized =
    to === 'obsidian'
      ? serializeObsidian(document, options)
      : serializeTiddlyWiki(document, options);

  return {
    text: serialized.text,
    document,
    diagnostics: [...document.diagnostics, ...serialized.diagnostics],
  };
}
