import type { ParsedDocument } from '../../../../model/ast/documents/ParsedDocument';
import type { ConversionOptions } from '../../../../conversion/types/ConversionOptions';
import type { ConversionDiagnostic } from '../../../../conversion/diagnostics/types/ConversionDiagnostic';
import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export type SerializationContext = {
  document: ParsedDocument;
  options: ConversionOptions;
  diagnostics: ConversionDiagnostic[];
  renderBlocks: (blocks: BlockNode[]) => string;
  renderInlines: (nodes: InlineNode[], parentMarker?: string) => string;
  renderInline: (node: InlineNode, marker?: string) => string;
};
