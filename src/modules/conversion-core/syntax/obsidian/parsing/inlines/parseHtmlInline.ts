import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { parseStaticHtmlInline } from '../html/parseStaticHtmlInline';
import { createRawInline } from './createRawInline';

export function parseHtmlInline(value: string): InlineNode {
  const staticNodes = parseStaticHtmlInline(value);

  if (staticNodes?.length === 1) {
    return staticNodes[0];
  }

  const reason = /^<iframe\b/i.test(value)
    ? 'Obsidian iframe embed'
    : 'HTML content';

  return createRawInline(value, reason);
}
