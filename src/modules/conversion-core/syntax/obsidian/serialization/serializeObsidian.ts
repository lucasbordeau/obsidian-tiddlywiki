import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { SerializationResult } from '@/modules/conversion-core/conversion/SerializationResult';
import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { renderBlocks } from '@/modules/conversion-core/syntax/obsidian/serialization/blocks/renderBlocks';
import { renderInlines } from '@/modules/conversion-core/syntax/obsidian/serialization/inlines/renderInlines';
import { renderInline } from '@/modules/conversion-core/syntax/obsidian/serialization/inlines/renderInline';

export function serializeObsidian(
  document: ParsedDocument,
  options: ConversionOptions = {},
): SerializationResult {
  const diagnostics: ConversionDiagnostic[] = [];

  const serializationContext: SerializationContext = {
    document,
    options,
    diagnostics,
    renderBlocks: (blocks, mode) =>
      renderBlocks(blocks, serializationContext, mode),
    renderInlines: (nodes, parentMarker) =>
      renderInlines(nodes, serializationContext, parentMarker),
    renderInline: (node, marker) =>
      renderInline(node, serializationContext, marker),
  };

  const text = renderBlocks(document.blocks, serializationContext);

  return { text, diagnostics };
}
