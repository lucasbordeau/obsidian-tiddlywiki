import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TIDDLYWIKI_BARE_EXTERNAL_LINK } from '@/modules/conversion-core/syntax/tiddlywiki/constants/TiddlyWikiBareExternalLink.const';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiExternalLink(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);
  const bareUrl = TIDDLYWIKI_BARE_EXTERNAL_LINK.exec(tail);

  if (bareUrl) {
    const target = bareUrl[0];

    return {
      node: {
        type: 'link',
        target,
        label: [{ type: 'text', value: target }],
        external: true,
        range: { start, end: start + target.length },
      },
      end: start + target.length,
    };
  }

  return undefined;
}
