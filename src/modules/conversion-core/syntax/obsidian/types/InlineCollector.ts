import type { Token } from './Token';
import type { TokenCursor } from './TokenCursor';
import type { InlineNode } from '../../../model/inlines/InlineNode';

export type InlineCollector = (
  tokens: Token[],
  cursor: TokenCursor,
  closingType?: string,
) => InlineNode[];
