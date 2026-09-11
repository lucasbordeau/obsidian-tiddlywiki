import type { ConversionOptions } from '../../../../conversion/ConversionOptions';
import type { ParsedDocument } from '../../../../model/ParsedDocument';
import { reportTiddlyWikiSerializationWarning } from './reportTiddlyWikiSerializationWarning';
import { preserveTiddlyWikiForeignSource } from '../preserveTiddlyWikiForeignSource';
import { serializeTiddlyWikiRawSource } from '../serializeTiddlyWikiRawSource';
import { serializeTiddlyWikiBlocks } from '../blocks/serializeTiddlyWikiBlocks';
import { serializeTiddlyWikiBlock } from '../blocks/serializeTiddlyWikiBlock';
import { isSimpleTiddlyWikiList } from '../blocks/isSimpleTiddlyWikiList';
import { isTiddlyWikiLineQuote } from '../blocks/isTiddlyWikiLineQuote';
import { serializeTiddlyWikiLineQuote } from '../blocks/serializeTiddlyWikiLineQuote';
import { serializeTiddlyWikiNativeList } from '../blocks/serializeTiddlyWikiNativeList';
import { serializeTiddlyWikiHtmlList } from '../blocks/serializeTiddlyWikiHtmlList';
import { serializeTiddlyWikiInlines } from '../inlines/serializeTiddlyWikiInlines';
import { serializeTiddlyWikiInlineNode } from '../inlines/serializeTiddlyWikiInlineNode';
import type { TiddlyWikiSerializationContext } from './TiddlyWikiSerializationContext';

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
