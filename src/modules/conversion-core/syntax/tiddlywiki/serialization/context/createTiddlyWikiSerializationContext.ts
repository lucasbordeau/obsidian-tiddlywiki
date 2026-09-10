import type { ConversionOptions } from '../../../../conversion/types/ConversionOptions';
import type { ParsedDocument } from '../../../../model/ast/documents/ParsedDocument';
import { reportTiddlyWikiSerializationWarning } from './reportTiddlyWikiSerializationWarning';
import { preserveTiddlyWikiForeignSource } from '../preservation/preserveTiddlyWikiForeignSource';
import { serializeTiddlyWikiRawSource } from '../preservation/serializeTiddlyWikiRawSource';
import { serializeTiddlyWikiBlocks } from '../blocks/serializeTiddlyWikiBlocks';
import { serializeTiddlyWikiBlock } from '../blocks/serializeTiddlyWikiBlock';
import { isSimpleTiddlyWikiList } from '../blocks/lists/isSimpleTiddlyWikiList';
import { isTiddlyWikiLineQuote } from '../blocks/quotes/isTiddlyWikiLineQuote';
import { serializeTiddlyWikiLineQuote } from '../blocks/quotes/serializeTiddlyWikiLineQuote';
import { serializeTiddlyWikiNativeList } from '../blocks/lists/serializeTiddlyWikiNativeList';
import { serializeTiddlyWikiHtmlList } from '../blocks/lists/serializeTiddlyWikiHtmlList';
import { serializeTiddlyWikiInlines } from '../inlines/serializeTiddlyWikiInlines';
import { serializeTiddlyWikiInlineNode } from '../inlines/serializeTiddlyWikiInlineNode';
import type { TiddlyWikiSerializationContext } from './types/TiddlyWikiSerializationContext';

export function createTiddlyWikiSerializationContext(
  document: ParsedDocument,
  options: ConversionOptions,
): TiddlyWikiSerializationContext {
  return {
    document,
    options,
    diagnostics: [],
    diagnose: reportTiddlyWikiSerializationWarning,
    preserve: preserveTiddlyWikiForeignSource,
    serializeRaw: serializeTiddlyWikiRawSource,
    serializeBlocks: serializeTiddlyWikiBlocks,
    serializeBlock: serializeTiddlyWikiBlock,
    isSimpleList: isSimpleTiddlyWikiList,
    isLineQuote: isTiddlyWikiLineQuote,
    serializeLineQuote: serializeTiddlyWikiLineQuote,
    serializeList: serializeTiddlyWikiNativeList,
    serializeHtmlList: serializeTiddlyWikiHtmlList,
    serializeInline: serializeTiddlyWikiInlines,
    serializeInlineNode: serializeTiddlyWikiInlineNode,
  };
}
