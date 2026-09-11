import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { SerializationContext } from '../../types/SerializationContext';
import { renderList } from './renderList';
import { renderBlock } from './renderBlock';

export function renderBlocks(
  blocks: BlockNode[],
  context: SerializationContext,
): string {
  let alternateListMarker = false;

  return blocks
    .map((block, index) => {
      const previous = blocks[index - 1];

      const continuesListKind =
        block.type === 'list' &&
        previous?.type === 'list' &&
        block.ordered === previous.ordered;

      alternateListMarker = continuesListKind ? !alternateListMarker : false;

      return block.type === 'list'
        ? renderList(block, context, alternateListMarker)
        : renderBlock(block, context);
    })
    .join('\n\n');
}
