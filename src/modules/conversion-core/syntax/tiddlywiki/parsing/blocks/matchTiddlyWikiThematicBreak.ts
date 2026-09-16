import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiBlockState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockState';
import { TiddlyWikiBlockMatch } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

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
