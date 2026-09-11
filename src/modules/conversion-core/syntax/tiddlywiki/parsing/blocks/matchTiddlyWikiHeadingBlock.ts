import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from './TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiHeadingBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { line, start, text } = state;

  const heading = /^(!{1,6})(.*)$/.exec(text);

  if (heading) {
    if (/^\.[\w-]/.test(heading[2])) {
      blocks.push(
        this.rawBlock(
          start,
          line.end,
          'The heading has TiddlyWiki CSS classes.',
        ),
      );
    } else {
      const content = heading[2].trimStart();

      blocks.push({
        type: 'heading',
        level: heading[1].length,
        children: this.parseInline(line.end - content.length, line.end),
        range: { start, end: line.end },
      });
    }

    lineIndex++;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
