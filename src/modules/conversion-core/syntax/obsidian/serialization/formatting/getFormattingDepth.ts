import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { isAsteriskFormatting } from './isAsteriskFormatting';

export function getFormattingDepth(node: InlineNode): number {
  if (!('children' in node)) {
    return 0;
  }

  const childDepth = Math.max(0, ...node.children.map(getFormattingDepth));

  return isAsteriskFormatting(node) ? 1 + childDepth : childDepth;
}
