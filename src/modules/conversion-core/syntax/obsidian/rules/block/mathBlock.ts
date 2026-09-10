import MarkdownIt from 'markdown-it';
import { lineText } from './lineText';
import { pushBlockToken } from './pushBlockToken';

export function mathBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const firstLine = lineText(state, startLine);

  if (firstLine.trim() === '$$') {
    let closingLine = startLine + 1;

    while (closingLine < endLine) {
      const closesMathBlock = lineText(state, closingLine).trim() === '$$';

      if (closesMathBlock) {
        break;
      }

      closingLine++;
    }

    if (closingLine < endLine) {
      const content = state
        .getLines(startLine + 1, closingLine, state.blkIndent, true)
        .replace(/\n$/, '');

      return pushBlockToken(
        state,
        'otw_math_block',
        startLine,
        closingLine + 1,
        content,
        silent,
      );
    }
  }

  const singleLineMath = /^\$\$(.+)\$\$\s*$/.exec(firstLine);

  if (singleLineMath) {
    return pushBlockToken(
      state,
      'otw_math_block',
      startLine,
      startLine + 1,
      singleLineMath[1],
      silent,
    );
  }

  return false;
}
