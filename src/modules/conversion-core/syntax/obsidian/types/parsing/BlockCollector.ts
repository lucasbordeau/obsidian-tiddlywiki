import type { Token } from './Token';
import type { TokenCursor } from './TokenCursor';
import type { ParseContext } from './ParseContext';
import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';

export type BlockCollector = (
  tokens: Token[],
  cursor: TokenCursor,
  context: ParseContext,
  closingType?: string,
) => BlockNode[];
