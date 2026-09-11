import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiSerializationContext } from '../context/TiddlyWikiSerializationContext';

export function isSimpleTiddlyWikiList(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'list' }>,
): boolean {
  if (block.ordered && block.start !== 1) {
    return false;
  }

  return block.children.every((entry) => {
    if (entry.checked !== undefined) {
      return false;
    }

    const [first, ...remaining] = entry.blocks;

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
