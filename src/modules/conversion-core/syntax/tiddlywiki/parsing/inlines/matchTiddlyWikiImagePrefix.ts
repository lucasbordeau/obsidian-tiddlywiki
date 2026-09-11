import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiImagePrefix(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('[img')) {
    return this.matchImage(start, end);
  }

  return undefined;
}
