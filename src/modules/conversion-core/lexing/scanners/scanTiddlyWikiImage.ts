import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findTiddlyWikiImageEnd } from '@/modules/conversion-core/lexing/boundaries/findTiddlyWikiImageEnd';

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
