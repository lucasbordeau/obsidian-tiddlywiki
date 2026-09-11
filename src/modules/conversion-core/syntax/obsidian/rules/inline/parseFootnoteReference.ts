import MarkdownIt from 'markdown-it';
import { pushInlineToken } from './pushInlineToken';

export function parseFootnoteReference(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);
  const footnote = /^\[\^([^\]\n]+)\]/.exec(remaining);

  if (footnote) {
    return pushInlineToken(
      state,
      'otw_footnote_reference',
      footnote[1],
      state.pos + footnote[0].length,
      silent,
    );
  }

  return false;
}
