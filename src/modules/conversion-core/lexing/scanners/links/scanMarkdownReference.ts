import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { markdownLinkEnd } from '../../boundaries/links/obsidian/markdownLinkEnd';

export function scanMarkdownReference(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isMarkdownImage =
    dialect === 'obsidian' && source.startsWith('![', cursor);

  const isMarkdownLink = dialect === 'obsidian' && source[cursor] === '[';

  if (isMarkdownImage || isMarkdownLink) {
    const end = markdownLinkEnd(source, cursor + (isMarkdownImage ? 1 : 0));

    if (end !== undefined) {
      return { kind: isMarkdownImage ? 'embed' : 'link', end: end };
    }
  }

  return undefined;
}
