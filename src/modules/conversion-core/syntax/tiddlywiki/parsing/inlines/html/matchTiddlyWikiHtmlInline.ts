import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiHtmlInline(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('<')) {
    const final = this.findHtmlEnd(start, end);

    if (final > start) {
      const staticNode = this.parseStaticHtmlInline(start, final, depth);

      return {
        node:
          staticNode ??
          this.rawInline(
            start,
            final,
            'HTML and widgets retain their original source.',
          ),
        end: final,
      };
    }
  }

  return undefined;
}
