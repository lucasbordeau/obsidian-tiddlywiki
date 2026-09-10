import type { Token } from '../../types/parsing/Token';
import type { ParseContext } from '../../types/parsing/ParseContext';
import type { BlockCollector } from '../../types/parsing/BlockCollector';
import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import { removeRanges } from '../source/removeRanges';

export function parseFootnoteDefinition(
  token: Token,
  context: ParseContext,
  collectNestedBlocks: BlockCollector,
): BlockNode {
  const nestedTokens = context.markdown.parse(
    token.content,
    context.environment,
  );

  const nestedContext = {
    ...context,
    source: token.content,
    lineOffsets: [],
  };

  const children = collectNestedBlocks(
    nestedTokens,
    { position: 0 },
    nestedContext,
  );

  removeRanges(children);

  return {
    type: 'footnoteDefinition',
    identifier: String(token.meta.identifier),
    children,
  };
}
