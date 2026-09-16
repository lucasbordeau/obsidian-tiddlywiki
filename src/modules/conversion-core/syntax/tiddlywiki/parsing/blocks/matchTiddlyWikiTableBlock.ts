import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiBlockState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockState';
import { TiddlyWikiBlockMatch } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiTableBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, text } = state;

  if (text.startsWith('|')) {
    let tableEnd = lineIndex + 1;

    while (tableEnd < endLine && /^\s*\|/.test(this.lines[tableEnd].text)) {
      tableEnd++;
    }

    blocks.push(this.parseTable(lineIndex, tableEnd));

    lineIndex = tableEnd;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
