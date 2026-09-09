import { parseObsidian } from './markdown/parseObsidian';
import { serializeObsidian } from './markdown/serializeObsidian';
import { parseTiddlyWiki } from './tiddlywiki/parseTiddlyWiki';
import { serializeTiddlyWiki } from './tiddlywiki/serializeTiddlyWiki';
import { ConversionOptions } from './types/ConversionOptions';
import { ConversionResult } from './types/ConversionResult';
import { Dialect } from './types/Dialect';

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
