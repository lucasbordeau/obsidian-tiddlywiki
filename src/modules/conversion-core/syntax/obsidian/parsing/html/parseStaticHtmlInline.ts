import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { parseChildren } from './parseChildren';

export function parseStaticHtmlInline(
  source: string,
): InlineNode[] | undefined {
  return parseChildren(source, { position: 0 });
}
