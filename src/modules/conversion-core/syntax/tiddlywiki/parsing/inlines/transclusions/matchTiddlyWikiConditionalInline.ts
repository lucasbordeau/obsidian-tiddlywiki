import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiConditionalInline(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (/^<%\s*if\s/.test(tail)) {
    const final = this.findConditionalEnd(start, end);

    return {
      node: this.rawInline(
        start,
        final,
        'Conditional branches require a TiddlyWiki evaluation context.',
      ),
      end: final,
    };
  }

  return undefined;
}
