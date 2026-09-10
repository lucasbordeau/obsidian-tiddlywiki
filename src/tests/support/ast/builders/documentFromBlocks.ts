import { BlockNode } from '../../../../modules/conversion-core/model/ast/blocks/BlockNode';
import { ParsedDocument } from '../../../../modules/conversion-core/model/ast/documents/ParsedDocument';

export function documentFromBlocks(blocks: BlockNode[]): ParsedDocument {
  return {
    dialect: 'obsidian',
    source: '',
    blocks,
    diagnostics: [],
    tokens: [],
  };
}
