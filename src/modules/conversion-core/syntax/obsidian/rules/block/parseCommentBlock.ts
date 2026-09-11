import MarkdownIt from 'markdown-it';
import { getLineText } from './getLineText';
import { pushBlockToken } from './pushBlockToken';

export function parseCommentBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const firstLine = getLineText(state, startLine);

  if (firstLine.startsWith('%%')) {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const closing = state.src.indexOf('%%', start + 2);

    if (closing === -1) {
      return false;
    }

    let closingLine = startLine;

    while (closingLine + 1 < endLine) {
      const nextLineFollowsComment =
        state.bMarks[closingLine + 1] > closing + 2;

      if (nextLineFollowsComment) {
        break;
      }

      closingLine++;
    }

    const tail = state.src.slice(closing + 2, state.eMarks[closingLine]);

    if (tail.trim() !== '') {
      return false;
    }

    const content = state
      .getLines(startLine, closingLine + 1, state.blkIndent, true)
      .replace(/\n$/, '');

    return pushBlockToken(
      state,
      'otw_comment_block',
      startLine,
      closingLine + 1,
      content,
      silent,
    );
  }

  return false;
}
