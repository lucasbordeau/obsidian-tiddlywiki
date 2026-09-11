import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';
import { findTiddlyWikiImageEnd } from '../boundaries/findTiddlyWikiImageEnd';

export function scanTiddlyWikiImage(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor, rest } = context;

  if (dialect === 'tiddlywiki' && /^\[img(?=\s|\[)/.test(rest)) {
    const end = findTiddlyWikiImageEnd(source, cursor);

    if (end !== undefined) {
      return { kind: 'embed', end: end };
    }
  }

  return undefined;
}
