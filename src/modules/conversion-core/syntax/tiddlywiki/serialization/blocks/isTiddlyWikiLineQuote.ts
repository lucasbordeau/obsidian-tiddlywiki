import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function isTiddlyWikiLineQuote(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'quote' }>,
): boolean {
  return block.children.every((child) => {
    if (child.type === 'quote') {
      return !child.callout && this.isLineQuote(child);
    }

    if (child.type !== 'paragraph') {
      return false;
    }

    return child.children.every((inline) => inline.type !== 'break');
  });
}
