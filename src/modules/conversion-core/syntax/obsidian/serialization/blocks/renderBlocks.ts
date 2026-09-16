import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import {
  BlockRenderMode,
  SerializationContext,
} from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { renderList } from '@/modules/conversion-core/syntax/obsidian/serialization/blocks/renderList';
import { renderBlock } from '@/modules/conversion-core/syntax/obsidian/serialization/blocks/renderBlock';

export function renderBlocks(
  blocks: BlockNode[],
  context: SerializationContext,
  mode: BlockRenderMode = 'document',
): string {
  let alternateListMarker = false;
  let renderedBlocks = '';

  for (const [index, block] of blocks.entries()) {
    const previous = blocks[index - 1];

    const continuesListKind =
      block.type === 'list' &&
      previous?.type === 'list' &&
      block.ordered === previous.ordered;

    alternateListMarker = continuesListKind ? !alternateListMarker : false;

    const renderedBlock =
      block.type === 'list'
        ? renderList(block, context, alternateListMarker)
        : renderBlock(block, context);

    const nestedListFollowsCompatibleBlock =
      mode === 'list-item' &&
      block.type === 'list' &&
      !continuesListKind &&
      (previous?.type === 'paragraph' || previous?.type === 'list');

    const separator = nestedListFollowsCompatibleBlock ? '\n' : '\n\n';

    renderedBlocks += index === 0 ? renderedBlock : separator + renderedBlock;
  }

  return renderedBlocks;
}
