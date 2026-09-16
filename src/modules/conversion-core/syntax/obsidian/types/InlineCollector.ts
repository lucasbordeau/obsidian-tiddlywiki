import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { TokenCursor } from '@/modules/conversion-core/syntax/obsidian/types/TokenCursor';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';

export type InlineCollector = (
  tokens: Token[],
  cursor: TokenCursor,
  closingType?: string,
) => InlineNode[];
