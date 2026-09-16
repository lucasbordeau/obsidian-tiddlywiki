import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function findTiddlyWikiImageContentStart(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): number {
  let cursor = start + 4;
  let quote = '';

  while (cursor < end) {
    if (quote) {
      if (this.source.startsWith(quote, cursor)) {
        cursor += quote.length;
        quote = '';
      } else {
        cursor++;
      }

      continue;
    }

    const character = this.source[cursor];

    if (character === '"' || character === "'") {
      quote = this.source.startsWith('"""', cursor) ? '"""' : character;
      cursor += quote.length;

      continue;
    }

    const dynamicDelimiters: [string, string][] = [
      ['{{{', '}}}'],
      ['{{', '}}'],
      ['<<', '>>'],
    ];

    const dynamic = dynamicDelimiters.find(([opening]) =>
      this.source.startsWith(opening, cursor),
    );

    if (dynamic) {
      cursor = this.findDelimitedEnd(cursor, end, dynamic[0], dynamic[1]);

      continue;
    }

    if (character === '[') {
      return cursor;
    }

    cursor++;
  }

  return end;
}
