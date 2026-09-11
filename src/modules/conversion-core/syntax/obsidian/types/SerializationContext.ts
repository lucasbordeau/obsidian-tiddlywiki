import type { ParsedDocument } from '../../../model/ParsedDocument';
import type { ConversionOptions } from '../../../conversion/ConversionOptions';
import type { ConversionDiagnostic } from '../../../conversion/ConversionDiagnostic';
import type { BlockNode } from '../../../model/blocks/BlockNode';
import type { InlineNode } from '../../../model/inlines/InlineNode';

export type SerializationContext = {
  document: ParsedDocument;
  options: ConversionOptions;
  diagnostics: ConversionDiagnostic[];
  renderBlocks: (blocks: BlockNode[]) => string;
  renderInlines: (nodes: InlineNode[], parentMarker?: string) => string;
  renderInline: (node: InlineNode, marker?: string) => string;
};
