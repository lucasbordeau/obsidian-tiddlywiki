import MarkdownIt from 'markdown-it';

export function pushInlineToken(
  state: MarkdownIt.StateInline,
  type: string,
  content: string,
  end: number,
  silent: boolean,
): boolean {
  if (!silent) {
    const token = state.push(type, '', 0);

    token.content = content;
  }

  state.pos = end;

  return true;
}
