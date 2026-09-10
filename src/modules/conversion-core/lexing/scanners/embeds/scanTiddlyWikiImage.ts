import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { tiddlyWikiImageEnd } from '../../boundaries/embeds/tiddlywiki/tiddlyWikiImageEnd';

export function scanTiddlyWikiImage(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor, rest } = context;

  if (dialect === 'tiddlywiki' && /^\[img(?=\s|\[)/.test(rest)) {
    const end = tiddlyWikiImageEnd(source, cursor);

    if (end !== undefined) {
      return { kind: 'embed', end: end };
    }
  }

  return undefined;
}
