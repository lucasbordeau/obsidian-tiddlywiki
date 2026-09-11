import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';

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
