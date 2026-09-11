import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';

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
