import type { ParsedDocument } from '../../../model/ast/documents/ParsedDocument';
import type { ConversionOptions } from '../../../conversion/types/ConversionOptions';
import type { SerializationResult } from '../../../conversion/types/SerializationResult';
import type { ConversionDiagnostic } from '../../../conversion/diagnostics/types/ConversionDiagnostic';
import type { SerializationContext } from '../types/serialization/SerializationContext';
import { renderBlocks } from './blocks/renderBlocks';
import { renderInlines } from './inlines/renderInlines';
import { renderInline } from './inlines/renderInline';

export function serializeObsidian(
  document: ParsedDocument,
  options: ConversionOptions = {},
): SerializationResult {
  const diagnostics: ConversionDiagnostic[] = [];

  const context: SerializationContext = {
    document,
    options,
    diagnostics,
    renderBlocks: (blocks) => renderBlocks(blocks, context),
    renderInlines: (nodes, parentMarker) =>
      renderInlines(nodes, context, parentMarker),
    renderInline: (node, marker) => renderInline(node, context, marker),
  };

  const text = renderBlocks(document.blocks, context);

  return { text, diagnostics };
}
