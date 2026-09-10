import type { Token } from './Token';
import type { TokenCursor } from './TokenCursor';
import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export type InlineCollector = (
  tokens: Token[],
  cursor: TokenCursor,
  closingType?: string,
) => InlineNode[];
