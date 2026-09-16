import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiSerializationContext } from '@/modules/conversion-core/syntax/tiddlywiki/serialization/context/TiddlyWikiSerializationContext';

export function isSimpleTiddlyWikiList(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
): boolean {
  if (block.ordered && block.start !== 1) {
    return false;
  }

  return block.children.every((listItem) => {
    if (listItem.checked !== undefined) {
      return false;
    }

    const [first, ...remaining] = listItem.blocks;

    if (!first || first.type !== 'paragraph') {
      return false;
    }

    const multilineFirst = first.children.some(
      (child) =>
        child.type === 'break' ||
        (child.type === 'text' && /[\r\n]/.test(child.value)),
    );

    if (multilineFirst) {
      return false;
    }

    return remaining.every(
      (child) => child.type === 'list' && this.isSimpleList(child),
    );
  });
}
