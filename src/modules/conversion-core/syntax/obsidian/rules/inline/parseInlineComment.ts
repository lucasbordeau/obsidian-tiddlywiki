import MarkdownIt from 'markdown-it';
import { pushInlineToken } from '@/modules/conversion-core/syntax/obsidian/rules/inline/pushInlineToken';

export function parseInlineComment(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);

  if (remaining.startsWith('%%')) {
    const end = state.src.indexOf('%%', state.pos + 2);

    if (end === -1) {
      return false;
    }

    return pushInlineToken(
      state,
      'otw_comment',
      state.src.slice(state.pos, end + 2),
      end + 2,
      silent,
    );
  }

  return false;
}
