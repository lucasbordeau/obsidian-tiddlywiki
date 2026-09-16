import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { TokenCursor } from '@/modules/conversion-core/syntax/obsidian/types/TokenCursor';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { parseInlineToken } from '@/modules/conversion-core/syntax/obsidian/parsing/inlines/parseInlineToken';

export function collectInlineNodes(
  tokens: Token[],
  cursor: TokenCursor,
  closingType?: string,
): InlineNode[] {
  const children: InlineNode[] = [];

  while (cursor.position < tokens.length) {
    const token = tokens[cursor.position++];

    if (token.type === closingType) {
      break;
    }

    children.push(parseInlineToken(token, tokens, cursor, collectInlineNodes));
  }

  return children.filter((node) => node.type !== 'text' || node.value !== '');
}
