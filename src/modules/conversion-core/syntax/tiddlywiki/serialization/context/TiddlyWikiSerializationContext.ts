import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { ConversionDiagnostic } from '../../../../conversion/ConversionDiagnostic';
import type { ConversionOptions } from '../../../../conversion/ConversionOptions';
import type { InlineNode } from '../../../../model/inlines/InlineNode';
import type { ParsedDocument } from '../../../../model/ParsedDocument';
import type { TiddlyWikiRangedNode } from '../../types/TiddlyWikiRangedNode';

export type TiddlyWikiSerializationContext = {
  document: ParsedDocument;
  options: ConversionOptions;
  diagnostics: ConversionDiagnostic[];
  diagnose(node: TiddlyWikiRangedNode, code: string, message: string): void;
  preserve(node: TiddlyWikiRangedNode, reason: string, block?: boolean): string;
  serializeRaw(node: Extract<BlockNode | InlineNode, { type: 'raw' }>): string;
  serializeBlocks(blocks: BlockNode[]): string;
  serializeBlock(block: BlockNode): string;
  isSimpleList(block: Extract<BlockNode, { type: 'list' }>): boolean;
  isLineQuote(block: Extract<BlockNode, { type: 'quote' }>): boolean;
  serializeLineQuote(
    block: Extract<BlockNode, { type: 'quote' }>,
    prefix: string,
  ): string;
  serializeList(
    block: Extract<BlockNode, { type: 'list' }>,
    parentPrefix: string,
  ): string;
  serializeHtmlList(block: Extract<BlockNode, { type: 'list' }>): string;
  serializeInline(children: InlineNode[]): string;
  serializeInlineNode(node: InlineNode): string;
};
