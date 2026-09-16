import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiBlocks(
  this: TiddlyWikiSerializationContext,
  blocks: BlockNode[],
): string {
  return blocks.map((block) => this.serializeBlock(block)).join('\n\n');
}
