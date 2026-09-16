import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { TokenCursor } from '@/modules/conversion-core/syntax/obsidian/types/TokenCursor';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';

export type BlockCollector = (
  tokens: Token[],
  cursor: TokenCursor,
  context: ParseContext,
  closingType?: string,
) => BlockNode[];
