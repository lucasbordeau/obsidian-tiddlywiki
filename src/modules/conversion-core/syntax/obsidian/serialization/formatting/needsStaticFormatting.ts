import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { getFormattingDepth } from './getFormattingDepth';
import { supportsStaticHtml } from './supportsStaticHtml';

export function needsStaticFormatting(node: InlineNode): boolean {
  return getFormattingDepth(node) >= 3 && supportsStaticHtml(node);
}
