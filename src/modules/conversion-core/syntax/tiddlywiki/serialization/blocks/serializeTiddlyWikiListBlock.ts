import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiListBlock(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
): string {
  const simpleList = this.isSimpleList(block);

  if (simpleList) {
    return this.serializeList(block, '');
  }

  this.diagnose(
    block,
    'tw-html-list',
    'The list uses HTML to preserve continuation blocks, task state or its starting number.',
  );

  return this.serializeHtmlList(block);
}
