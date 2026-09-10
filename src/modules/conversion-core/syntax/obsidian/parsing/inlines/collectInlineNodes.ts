import type { Token } from '../../types/parsing/Token';
import type { TokenCursor } from '../../types/parsing/TokenCursor';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';
import { parseInlineToken } from './parseInlineToken';

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
