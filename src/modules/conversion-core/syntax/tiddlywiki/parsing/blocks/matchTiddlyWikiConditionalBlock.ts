import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from './TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiConditionalBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, start, text } = state;

  if (/^<%\s*if\s/.test(text)) {
    const final = this.findConditionalEnd(start, this.lines[endLine - 1].end);

    blocks.push(
      this.rawBlock(
        start,
        final,
        'Conditional branches require a TiddlyWiki evaluation context.',
      ),
    );

    while (lineIndex < endLine && this.lines[lineIndex].end <= final) {
      lineIndex++;
    }

    const remaining = this.lines[lineIndex];

    if (remaining && remaining.start < final) {
      blocks.push({
        type: 'paragraph',
        children: this.parseInline(final, remaining.end),
        range: { start: final, end: remaining.end },
      });

      lineIndex++;
    }

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
