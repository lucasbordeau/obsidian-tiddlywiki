import type { Token } from '../../types/Token';
import type { InlineNode } from '../../../../model/inlines/InlineNode';
import { collectInlineNodes } from './collectInlineNodes';

export function collectInlineChildren(token: Token | undefined): InlineNode[] {
  return collectInlineNodes(token?.children ?? [], { position: 0 });
}
