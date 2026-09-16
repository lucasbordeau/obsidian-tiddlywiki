import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { parseChildren } from '@/modules/conversion-core/syntax/obsidian/parsing/html/parseChildren';

export function parseStaticHtmlInline(
  source: string,
): InlineNode[] | undefined {
  return parseChildren(source, { position: 0 });
}
