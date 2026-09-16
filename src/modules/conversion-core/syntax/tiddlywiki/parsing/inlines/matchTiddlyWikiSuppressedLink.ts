import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TIDDLYWIKI_BARE_EXTERNAL_LINK } from '@/modules/conversion-core/syntax/tiddlywiki/constants/TiddlyWikiBareExternalLink.const';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiSuppressedLink(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  const escapedExternal = tail.startsWith('~')
    ? TIDDLYWIKI_BARE_EXTERNAL_LINK.exec(tail.slice(1))
    : null;

  if (escapedExternal) {
    return {
      node: {
        type: 'text',
        value: escapedExternal[0],
        range: { start, end: start + escapedExternal[0].length + 1 },
      },
      end: start + escapedExternal[0].length + 1,
    };
  }

  const escapedLink = /^~([A-Z][a-z]+[A-Z][A-Za-z]*)/.exec(tail);

  if (escapedLink) {
    return {
      node: {
        type: 'text',
        value: escapedLink[1],
        range: { start, end: start + escapedLink[0].length },
      },
      end: start + escapedLink[0].length,
    };
  }

  return undefined;
}
