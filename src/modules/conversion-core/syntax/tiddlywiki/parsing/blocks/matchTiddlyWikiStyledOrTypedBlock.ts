import type { BlockNode } from '../../../../model/blocks/BlockNode';
import type { TiddlyWikiBlockState } from './TiddlyWikiBlockState';
import type { TiddlyWikiBlockMatch } from './TiddlyWikiBlockMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiStyledOrTypedBlock(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiBlockState,
): TiddlyWikiBlockMatch | undefined {
  const blocks: BlockNode[] = [];
  let lineIndex = state.lineIndex;
  const { endLine, start, text } = state;

  const isTypedBlock = /^\$\$\$[^\r\n]*$/.test(text);
  const isStyledBlock = /^@@(?:[^\s:]+:[^;\r\n]+;)*(?:\.[^\s]+)?$/.test(text);

  if (isTypedBlock || isStyledBlock) {
    const marker = isTypedBlock ? '$$$' : '@@';
    let closingLine = lineIndex + 1;

    while (closingLine < endLine) {
      const foundClosingMarker = this.lines[closingLine].text === marker;

      if (foundClosingMarker) {
        break;
      }

      closingLine++;
    }

    const finalLine = Math.min(closingLine, endLine - 1);

    blocks.push(
      this.rawBlock(
        start,
        this.lines[finalLine].end,
        isTypedBlock
          ? 'Typed blocks retain their source content type and renderer.'
          : 'Styled blocks retain their classes and CSS.',
      ),
    );

    lineIndex = closingLine < endLine ? closingLine + 1 : endLine;

    return { blocks, nextLine: lineIndex };
  }

  return undefined;
}
