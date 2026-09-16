import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiDash(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);
  const dash = /^-{2,3}(?!-)/.exec(tail);

  if (dash) {
    return {
      node: {
        type: 'text',
        value: dash[0].length === 2 ? '–' : '—',
        range: { start, end: start + dash[0].length },
      },
      end: start + dash[0].length,
    };
  }

  return undefined;
}
