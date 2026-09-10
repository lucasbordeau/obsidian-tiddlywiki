import MarkdownIt from 'markdown-it';

export function pushBlockToken(
  state: MarkdownIt.StateBlock,
  type: string,
  startLine: number,
  endLine: number,
  content: string,
  silent: boolean,
): boolean {
  if (silent) {
    return true;
  }

  const token = state.push(type, '', 0);

  token.block = true;
  token.map = [startLine, endLine];
  token.content = content;

  state.line = endLine;

  return true;
}
