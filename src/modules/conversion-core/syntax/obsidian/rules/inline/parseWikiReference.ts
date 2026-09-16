import MarkdownIt from 'markdown-it';
import { findDelimiter } from '@/modules/conversion-core/syntax/obsidian/rules/inline/findDelimiter';
import { pushInlineToken } from '@/modules/conversion-core/syntax/obsidian/rules/inline/pushInlineToken';

export function parseWikiReference(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  const remaining = state.src.slice(state.pos);
  const embedded = remaining.startsWith('![[');
  const wikiLink = remaining.startsWith('[[');

  if (embedded || wikiLink) {
    const openingLength = embedded ? 3 : 2;
    const end = findDelimiter(state.src, ']]', state.pos + openingLength);

    const crossesLine =
      end !== -1 && state.src.slice(state.pos, end).includes('\n');

    if (end === -1 || crossesLine) {
      return false;
    }

    const content = state.src.slice(state.pos + openingLength, end);

    return pushInlineToken(
      state,
      embedded ? 'otw_embed' : 'otw_wikilink',
      content,
      end + 2,
      silent,
    );
  }

  return false;
}
