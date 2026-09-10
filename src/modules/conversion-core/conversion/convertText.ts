import { parseObsidian } from '../syntax/obsidian/parsing/parseObsidian';
import { serializeObsidian } from '../syntax/obsidian/serialization/serializeObsidian';
import { parseTiddlyWiki } from '../syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../syntax/tiddlywiki/serialization/serializeTiddlyWiki';
import type { ConversionOptions } from './types/ConversionOptions';
import type { ConversionResult } from './types/ConversionResult';
import type { Dialect } from '../model/source/Dialect';

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
