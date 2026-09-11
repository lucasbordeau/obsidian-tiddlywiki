import MarkdownIt from 'markdown-it';
import { pushInlineToken } from './pushInlineToken';

export function parseInlineFootnote(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);

  if (remaining.startsWith('^[')) {
    const closingBracket = state.md.helpers.parseLinkLabel(
      state,
      state.pos + 1,
      false,
    );

    if (closingBracket === -1) {
      return false;
    }

    const originalFootnote = state.src.slice(state.pos, closingBracket + 1);

    return pushInlineToken(
      state,
      'otw_inline_footnote',
      originalFootnote,
      closingBracket + 1,
      silent,
    );
  }

  return false;
}
