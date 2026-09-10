import MarkdownIt from 'markdown-it';
import { lineText } from './lineText';
import { pushBlockToken } from './pushBlockToken';

export function frontMatterBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const firstLine = lineText(state, startLine);

  const frontMatter =
    startLine === 0 &&
    state.parentType === 'root' &&
    firstLine.trim() === '---';

  if (frontMatter) {
    let closingLine = startLine + 1;

    while (closingLine < endLine) {
      const closesFrontMatter = /^(---|\.\.\.)\s*$/.test(
        lineText(state, closingLine),
      );

      if (closesFrontMatter) {
        break;
      }

      closingLine++;
    }

    if (closingLine < endLine) {
      return pushBlockToken(
        state,
        'otw_frontmatter',
        startLine,
        closingLine + 1,
        state.getLines(startLine, closingLine + 1, state.blkIndent, true),
        silent,
      );
    }
  }

  return false;
}
