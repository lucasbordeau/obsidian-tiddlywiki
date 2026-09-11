import type { ConversionOptions } from '../../../conversion/ConversionOptions';
import type { ParsedDocument } from '../../../model/ParsedDocument';
import type { SerializationResult } from '../../../conversion/SerializationResult';
import { createTiddlyWikiSerializationContext } from './context/createTiddlyWikiSerializationContext';

export function serializeTiddlyWiki(
  document: ParsedDocument,
  options: ConversionOptions = {},
): SerializationResult {
  const serializer = createTiddlyWikiSerializationContext(document, options);

  return {
    text: serializer.serializeBlocks(document.blocks),
    diagnostics: serializer.diagnostics,
  };
}
