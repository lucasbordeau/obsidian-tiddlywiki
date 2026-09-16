import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { SerializationResult } from '@/modules/conversion-core/conversion/SerializationResult';
import { createTiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/createTiddlyWikiSerializationContext';

export function serializeTiddlyWiki(
  document: ParsedDocument,
  options: ConversionOptions = {},
): SerializationResult {
  const serializationContext = createTiddlyWikiSerializationContext(
    document,
    options,
  );

  return {
    text: serializationContext.serializeBlocks(document.blocks),
    diagnostics: serializationContext.diagnostics,
  };
}
