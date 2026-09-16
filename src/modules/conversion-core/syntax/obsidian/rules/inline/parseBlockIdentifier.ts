import MarkdownIt from 'markdown-it';
import { pushInlineToken } from '@/modules/conversion-core/syntax/obsidian/rules/inline/pushInlineToken';

export function parseBlockIdentifier(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);
  const blockIdentifier = /^\^[a-zA-Z0-9-]+(?=\s*$)/.exec(remaining);

  const startsBlockIdentifier =
    state.pos === 0 || /\s/.test(state.src[state.pos - 1]);

  if (blockIdentifier && startsBlockIdentifier) {
    return pushInlineToken(
      state,
      'otw_block_identifier',
      blockIdentifier[0],
      state.pos + blockIdentifier[0].length,
      silent,
    );
  }

  return false;
}
