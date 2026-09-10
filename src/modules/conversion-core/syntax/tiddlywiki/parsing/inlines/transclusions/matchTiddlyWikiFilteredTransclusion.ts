import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiFilteredTransclusion(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('{{{')) {
    const closing = this.findDelimitedEnd(start, end, '{{{', '}}}');

    return {
      node: this.rawInline(
        start,
        closing,
        'Filtered transclusions require a TiddlyWiki evaluation context.',
      ),
      end: closing,
    };
  }

  return undefined;
}
