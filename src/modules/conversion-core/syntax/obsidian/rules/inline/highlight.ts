import MarkdownIt from 'markdown-it';
import { findDelimiter } from './findDelimiter';

export function highlight(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);

  if (remaining.startsWith('==') && !remaining.startsWith('===')) {
    const end = findDelimiter(state.src, '==', state.pos + 2, true);

    if (end === -1 || end === state.pos + 2) {
      return false;
    }

    const content = state.src.slice(state.pos + 2, end);

    if (!silent) {
      const token = state.push('otw_highlight', '', 0);

      token.children = [];

      state.md.inline.parse(content, state.md, state.env, token.children);
    }

    state.pos = end + 2;

    return true;
  }

  return false;
}
