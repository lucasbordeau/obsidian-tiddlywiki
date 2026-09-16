import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TIDDLYWIKI_EXTERNAL_PROTOCOL } from '@/modules/conversion-core/syntax/tiddlywiki/constants/TiddlyWikiExternalProtocol.const';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiWikiLink(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const external = this.source.startsWith('[ext[', start);

  if (this.source.startsWith('[[', start) || external) {
    const contentStart = start + (external ? 5 : 2);
    let closing = -1;
    let linkEnd = end;

    for (let cursor = contentStart; cursor < end; cursor++) {
      const character = this.source[cursor];
      const isLineBreak = character === '\r' || character === '\n';

      const hasClosingDelimiter =
        cursor + 1 < end &&
        character === ']' &&
        this.source[cursor + 1] === ']';

      if (!external && isLineBreak) {
        linkEnd = cursor;

        break;
      }

      if (hasClosingDelimiter) {
        closing = cursor;

        break;
      }
    }

    if (closing < 0) {
      return {
        node: this.rawInline(start, linkEnd, 'The wiki link is unfinished.'),
        end: linkEnd,
      };
    }

    const value = this.source.slice(contentStart, closing);
    const separator = value.indexOf('|');
    const label = separator < 0 ? value : value.slice(0, separator);
    const target = separator < 0 ? value : value.slice(separator + 1) || label;
    const final = closing + 2;

    return {
      node: {
        type: 'link',
        target,
        label: [
          {
            type: 'text',
            value: label,
            range: { start: contentStart, end: contentStart + label.length },
          },
        ],
        external: external || TIDDLYWIKI_EXTERNAL_PROTOCOL.test(target),
        range: { start, end: final },
      },
      end: final,
    };
  }

  return undefined;
}
