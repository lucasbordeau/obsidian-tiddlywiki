import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { reportTiddlyWikiSerializationWarning } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/reportTiddlyWikiSerializationWarning';
import { preserveTiddlyWikiForeignSource } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/preserveTiddlyWikiForeignSource';
import { serializeTiddlyWikiRawSource } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/serializeTiddlyWikiRawSource';
import { serializeTiddlyWikiBlocks } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiBlocks';
import { serializeTiddlyWikiBlock } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiBlock';
import { isSimpleTiddlyWikiList } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/isSimpleTiddlyWikiList';
import { isTiddlyWikiLineQuote } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/isTiddlyWikiLineQuote';
import { serializeTiddlyWikiLineQuote } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiLineQuote';
import { serializeTiddlyWikiNativeList } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiNativeList';
import { serializeTiddlyWikiHtmlList } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/blocks/serializeTiddlyWikiHtmlList';
import { serializeTiddlyWikiInlines } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/inlines/serializeTiddlyWikiInlines';
import { serializeTiddlyWikiInlineNode } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/inlines/serializeTiddlyWikiInlineNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

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
