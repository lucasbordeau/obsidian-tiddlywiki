import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiStyledInline(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('@@')) {
    const closing = this.findFormattingEnd(start + 2, end, '@@');
    const final = closing < 0 ? end : closing + 2;
    const styled = /^\.[\w-]|^[^\s:]+:[^;]+;/.test(tail.slice(2));

    if (styled) {
      return {
        node: this.rawInline(
          start,
          final,
          'TiddlyWiki styled spans retain their CSS and original syntax.',
        ),
        end: final,
      };
    }
  }

  return undefined;
}
