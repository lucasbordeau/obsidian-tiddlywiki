import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { parseStaticHtmlInline } from '../html/parseStaticHtmlInline';
import { rawInline } from './rawInline';

export function htmlInline(value: string): InlineNode {
  const staticNodes = parseStaticHtmlInline(value);

  if (staticNodes?.length === 1) {
    return staticNodes[0];
  }

  const reason = /^<iframe\b/i.test(value)
    ? 'Obsidian iframe embed'
    : 'HTML content';

  return rawInline(value, reason);
}
