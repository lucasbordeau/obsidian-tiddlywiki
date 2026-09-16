import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';

export function removeRanges(blocks: BlockNode[]): void {
  for (const block of blocks) {
    delete block.range;

    if (block.type === 'quote' || block.type === 'footnoteDefinition') {
      removeRanges(block.children);
    }

    if (block.type === 'list') {
      for (const listItem of block.children) {
        delete listItem.range;

        removeRanges(listItem.blocks);
      }
    }
  }
}
