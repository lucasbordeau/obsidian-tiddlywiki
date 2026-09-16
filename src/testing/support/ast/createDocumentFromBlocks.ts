import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { ParsedDocument } from '@/modules/conversion-core/model/ParsedDocument';

export function createDocumentFromBlocks(blocks: BlockNode[]): ParsedDocument {
  return {
    dialect: 'obsidian',
    source: '',
    blocks,
    diagnostics: [],
    tokens: [],
  };
}
