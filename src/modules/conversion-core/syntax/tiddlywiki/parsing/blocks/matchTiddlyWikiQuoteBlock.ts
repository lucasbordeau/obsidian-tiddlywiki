import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from './TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiQuoteBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, start, text } = state;

  const quoteFence = /^(<{3,})(.*)$/.exec(text);

  if (quoteFence) {
    let closingLine = lineIndex + 1;
    const closePattern = new RegExp('^\\s*' + quoteFence[1] + '(?!<)(.*)$');

    while (closingLine < endLine) {
      const candidate = this.lines[closingLine];
      const foundQuoteClosingMarker = closePattern.test(candidate.text);

      if (foundQuoteClosingMarker) {
        break;
      }

      const protectedCodeFence = /^\s*```[\w-]*$/.test(candidate.text);

      if (protectedCodeFence) {
        closingLine += 2;

        while (closingLine < endLine) {
          const foundCodeClosingMarker = this.lines[closingLine].text === '```';

          if (foundCodeClosingMarker) {
            break;
          }

          closingLine++;
        }
      }

      closingLine++;
    }

    const closed = closingLine < endLine;

    const end = closed
      ? this.lines[closingLine].end
      : this.lines[endLine - 1].end;

    const closingSuffix = closed
      ? closePattern.exec(this.lines[closingLine].text)?.[1].trim()
      : '';

    const hasQuoteDecoration = Boolean(quoteFence[2].trim() || closingSuffix);

    if (hasQuoteDecoration) {
      blocks.push(
        this.rawBlock(
          start,
          end,
          'Quote citations and CSS classes are retained in their original syntax.',
        ),
      );
    } else {
      blocks.push({
        type: 'quote',
        children: this.parseBlocks(lineIndex + 1, closingLine),
        range: { start, end },
      });
    }

    if (!closed) {
      this.warn(
        'tw-unclosed-quote',
        'The quote continues to the end of the source.',
        { start, end },
      );
    }

    lineIndex = closed ? closingLine + 1 : endLine;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
