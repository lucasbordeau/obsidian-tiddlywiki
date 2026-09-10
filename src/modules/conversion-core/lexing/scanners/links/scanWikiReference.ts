import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { delimitedEnd } from '../../boundaries/delimiters/delimitedEnd';

export function scanWikiReference(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isWikiEmbed =
    dialect === 'obsidian' && source.startsWith('![[', cursor);

  if (isWikiEmbed || source.startsWith('[[', cursor)) {
    return {
      kind: isWikiEmbed ? 'embed' : 'link',
      end: delimitedEnd(source, cursor + (isWikiEmbed ? 3 : 2), ']]'),
    };
  }

  return undefined;
}
