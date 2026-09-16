import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { collectInlineNodes } from '@/modules/conversion-core/syntax/obsidian/parsing/inlines/collectInlineNodes';

export function collectInlineChildren(token: Token | undefined): InlineNode[] {
  return collectInlineNodes(token?.children ?? [], { position: 0 });
}
