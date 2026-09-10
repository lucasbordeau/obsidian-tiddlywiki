import type { Token } from '../../types/parsing/Token';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { collectInlineNodes } from './collectInlineNodes';

export function inlineChildren(token: Token | undefined): InlineNode[] {
  return collectInlineNodes(token?.children ?? [], { position: 0 });
}
