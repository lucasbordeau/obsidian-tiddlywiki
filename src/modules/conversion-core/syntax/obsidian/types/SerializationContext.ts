import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type BlockRenderMode = 'document' | 'list-item';

export type SerializationContext = {
  document: ParsedDocument;
  options: ConversionOptions;
  diagnostics: ConversionDiagnostic[];
  renderBlocks: (blocks: BlockNode[], mode?: BlockRenderMode) => string;
  renderInlines: (nodes: InlineNode[], parentMarker?: string) => string;
  renderInline: (node: InlineNode, marker?: string) => string;
};
