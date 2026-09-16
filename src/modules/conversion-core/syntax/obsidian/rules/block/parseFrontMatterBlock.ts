import MarkdownIt from 'markdown-it';
import { getLineText } from '@/modules/conversion-core/syntax/obsidian/rules/block/getLineText';
import { pushBlockToken } from '@/modules/conversion-core/syntax/obsidian/rules/block/pushBlockToken';

export function parseFrontMatterBlock(
  state: MarkdownIt.StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const firstLine = getLineText(state, startLine);

  const frontMatter =
    startLine === 0 &&
    state.parentType === 'root' &&
    firstLine.trim() === '---';

  if (frontMatter) {
    let closingLine = startLine + 1;

    while (closingLine < endLine) {
      const closesFrontMatter = /^(---|\.\.\.)\s*$/.test(
        getLineText(state, closingLine),
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
