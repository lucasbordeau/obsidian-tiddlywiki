import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { formattingDepth } from './formattingDepth';
import { staticHtmlSupported } from './staticHtmlSupported';

export function needsStaticFormatting(node: InlineNode): boolean {
  return formattingDepth(node) >= 3 && staticHtmlSupported(node);
}
