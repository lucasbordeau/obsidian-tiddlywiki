import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { TiddlyWikiBlockState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockState';
import { TiddlyWikiBlockMatch } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/blocks/TiddlyWikiBlockMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiParagraphBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, start } = state;

  const end = this.findParagraphEnd(start, this.lines[endLine - 1].end);

  blocks.push({
    type: 'paragraph',
    children: this.parseInline(start, end),
    range: { start, end },
  });

  while (lineIndex < endLine && this.lines[lineIndex].end <= end) {
    lineIndex++;
  }

  return { blocks, nextLine: lineIndex };
}
