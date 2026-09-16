import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { parseStaticHtmlInline } from '@/modules/conversion-core/syntax/obsidian/parsing/html/parseStaticHtmlInline';
import { createRawInline } from '@/modules/conversion-core/syntax/obsidian/parsing/inlines/createRawInline';

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
