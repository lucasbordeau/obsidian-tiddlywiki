import MarkdownIt from 'markdown-it';
import { findDelimiter } from '@/modules/conversion-core/syntax/obsidian/rules/inline/findDelimiter';
import { pushInlineToken } from '@/modules/conversion-core/syntax/obsidian/rules/inline/pushInlineToken';

export function parseInlineMath(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);

  const opensMath =
    remaining[0] === '$' &&
    remaining[1] !== '$' &&
    !/\s/.test(remaining[1] ?? ' ');

  if (opensMath) {
    const end = findDelimiter(state.src, '$', state.pos + 1);

    const closesMath =
      end !== -1 &&
      !/\s/.test(state.src[end - 1]) &&
      !/\d/.test(state.src[end + 1] ?? '');

    if (closesMath) {
      return pushInlineToken(
        state,
        'otw_math',
        state.src.slice(state.pos + 1, end),
        end + 1,
        silent,
      );
    }
  }

  return false;
}
