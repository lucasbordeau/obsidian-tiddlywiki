import type { BlockNode } from '../../../model/blocks/BlockNode';

export function removeRanges(blocks: BlockNode[]): void {
  for (const block of blocks) {
    delete block.range;

    if (block.type === 'quote' || block.type === 'footnoteDefinition') {
      removeRanges(block.children);
    }

    if (block.type === 'list') {
      for (const entry of block.children) {
        delete entry.range;

        removeRanges(entry.blocks);
      }
    }
  }
}
