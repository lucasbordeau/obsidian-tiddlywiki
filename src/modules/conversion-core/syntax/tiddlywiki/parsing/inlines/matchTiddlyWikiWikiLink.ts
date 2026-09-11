import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import { TIDDLYWIKI_EXTERNAL_PROTOCOL } from '../../constants/TiddlyWikiExternalProtocol.const';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiWikiLink(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('[[') || tail.startsWith('[ext[')) {
    const external = tail.startsWith('[ext[');
    const contentStart = start + (external ? 5 : 2);
    const closing = this.source.indexOf(']]', contentStart);
    const hasClosing = closing >= 0 && closing + 2 <= end;

    if (!hasClosing) {
      return {
        node: this.rawInline(start, end, 'The wiki link is unfinished.'),
        end,
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
