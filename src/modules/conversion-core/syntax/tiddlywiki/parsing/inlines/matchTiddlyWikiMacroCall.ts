import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiMacroCall(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);
  const macroClosingOffset = this.source.indexOf('>>', start + 2);

  const macroHasClosingDelimiter =
    tail.startsWith('<<') &&
    macroClosingOffset < end &&
    macroClosingOffset >= 0;

  if (macroHasClosingDelimiter) {
    const final = this.findDelimitedEnd(start, end, '<<', '>>');

    return {
      node: this.rawInline(
        start,
        final,
        'Macro calls require a TiddlyWiki evaluation context.',
      ),
      end: final,
    };
  }

  if (tail.startsWith('<<')) {
    return {
      node: { type: 'text', value: '<<', range: { start, end: start + 2 } },
      end: start + 2,
    };
  }

  return undefined;
}
