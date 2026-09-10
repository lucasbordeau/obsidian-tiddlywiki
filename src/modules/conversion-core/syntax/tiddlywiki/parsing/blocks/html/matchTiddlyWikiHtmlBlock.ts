import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiBlockState } from '../types/TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from '../types/TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiHtmlBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, start, text } = state;

  const blockHtml =
    /^<(?:div|pre|ul|ol|table|blockquote|aside|section|article|\$[\w-]+)(?=[\s/>])/i.test(
      text,
    );

  const staticInlineWidget = /^<\$(?:link|image)(?=[\s/>])/i.test(text);

  if (blockHtml && !staticInlineWidget) {
    const opaqueEnd = this.findHtmlEnd(start, this.lines[endLine - 1].end);

    if (opaqueEnd > start) {
      const staticBlock = this.parseStaticHtmlBlock(start, opaqueEnd);

      blocks.push(
        staticBlock ??
          this.rawBlock(
            start,
            opaqueEnd,
            'HTML and widgets are preserved without execution.',
          ),
      );

      while (lineIndex < endLine) {
        const lineWithinHtml = this.lines[lineIndex].end <= opaqueEnd;

        if (!lineWithinHtml) {
          break;
        }

        lineIndex++;
      }

      const remainingLine = this.lines[lineIndex];

      const hasInlineRemainder =
        remainingLine && remainingLine.start < opaqueEnd;

      if (hasInlineRemainder) {
        blocks.push({
          type: 'paragraph',
          children: this.parseInline(opaqueEnd, remainingLine.end),
          range: { start: opaqueEnd, end: remainingLine.end },
        });

        lineIndex++;
      }

      return { blocks, nextLine: lineIndex };
    }
  }

  return undefined;
}
