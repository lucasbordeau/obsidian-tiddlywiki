import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import { ConversionOptions } from '@/modules/conversion-core/conversion/ConversionOptions';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';
import { TiddlyWikiRangedNode } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiRangedNode';

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
