import MarkdownIt from 'markdown-it';

export function getLineText(
  state: MarkdownIt.StateBlock,
  line: number,
): string {
  return state.src.slice(
    state.bMarks[line] + state.tShift[line],
    state.eMarks[line],
  );
}
