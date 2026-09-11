import type { Token } from '../../types/Token';
import type { ParseContext } from '../../types/ParseContext';
import type { BlockCollector } from '../../types/BlockCollector';
import type { BlockNode } from '../../../../model/blocks/BlockNode';
import { removeRanges } from '../removeRanges';

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
