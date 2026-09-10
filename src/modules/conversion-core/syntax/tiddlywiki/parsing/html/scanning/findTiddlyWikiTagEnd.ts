import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function findTiddlyWikiTagEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): number {
  let quote = '';

  for (let cursor = start; cursor < end; cursor++) {
    const character = this.source[cursor];

    if (quote) {
      if (this.source.startsWith(quote, cursor)) {
        cursor += quote.length - 1;
        quote = '';
      }
    } else if (character === '"' || character === "'") {
      quote = this.source.startsWith('"""', cursor) ? '"""' : character;
      cursor += quote.length - 1;
    } else if (character === '>') {
      return cursor + 1;
    }
  }

  return -1;
}
