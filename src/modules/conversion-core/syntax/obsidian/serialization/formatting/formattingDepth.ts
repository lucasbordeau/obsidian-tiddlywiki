import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { isAsteriskFormatting } from './isAsteriskFormatting';

export function formattingDepth(node: InlineNode): number {
  if (!('children' in node)) {
    return 0;
  }

  const childDepth = Math.max(0, ...node.children.map(formattingDepth));

  return isAsteriskFormatting(node) ? 1 + childDepth : childDepth;
}
