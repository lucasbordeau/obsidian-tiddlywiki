import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiInlineCode(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('`')) {
    const delimiter = tail.startsWith('``') ? '``' : '`';
    const closing = this.source.indexOf(delimiter, start + delimiter.length);
    const closed = closing >= 0 && closing + delimiter.length <= end;
    const final = closed ? closing + delimiter.length : end;

    if (!closed) {
      this.warn(
        'tw-unclosed-inline-code',
        'Inline code continues to the end of the containing block.',
        { start, end: final },
      );
    }

    return {
      node: {
        type: 'code',
        value: this.source.slice(
          start + delimiter.length,
          closed ? closing : end,
        ),
        range: { start, end: final },
      },
      end: final,
    };
  }

  return undefined;
}
