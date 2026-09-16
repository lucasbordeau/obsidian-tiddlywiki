import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { BlockCollector } from '@/modules/conversion-core/syntax/obsidian/types/BlockCollector';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { removeRanges } from '@/modules/conversion-core/syntax/obsidian/parsing/removeRanges';

export function parseFootnoteDefinition(
  token: Token,
  context: ParseContext,
  collectNestedBlocks: BlockCollector,
): BlockNode {
  const nestedTokens = context.obsidianParser.parse(
    token.content,
    context.parserEnvironment,
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
