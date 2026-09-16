import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiVariableDisplay(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('((')) {
    const opening = tail.startsWith('(((') ? '(((' : '((';
    const closing = opening === '(((' ? ')))' : '))';
    const final = this.findDelimitedEnd(start, end, opening, closing);

    return {
      node: this.rawInline(
        start,
        final,
        'Multi-valued variable and filter displays require a TiddlyWiki evaluation context.',
      ),
      end: final,
    };
  }

  return undefined;
}
