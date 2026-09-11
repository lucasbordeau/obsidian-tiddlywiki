import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from './TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

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
