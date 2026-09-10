import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiBlockState } from '../types/TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from '../types/TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiThematicBreak(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { line, start, text } = state;

  if (/^-{3,}\s*$/.test(text)) {
    blocks.push({ type: 'thematicBreak', range: { start, end: line.end } });

    lineIndex++;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
