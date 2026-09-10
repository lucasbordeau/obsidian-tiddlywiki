import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/types/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiBlocks(
  this: TiddlyWikiSerializationContext,
  blocks: BlockNode[],
): string {
  return blocks.map((block) => this.serializeBlock(block)).join('\n\n');
}
