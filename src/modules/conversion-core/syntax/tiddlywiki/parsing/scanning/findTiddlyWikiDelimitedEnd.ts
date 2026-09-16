import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function findTiddlyWikiDelimitedEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  opening: string,
  closing: string,
): number {
  let cursor = start + opening.length;
  let quote = '';
  const quoted = opening === '<<';

  while (cursor < end) {
    const character = this.source[cursor];

    if (quoted && quote) {
      if (this.source.startsWith(quote, cursor)) {
        cursor += quote.length - 1;
        quote = '';
      }
    } else if (quoted && this.source.startsWith('[[', cursor)) {
      quote = ']]';
      cursor++;
    } else if (quoted && (character === '"' || character === "'")) {
      quote = this.source.startsWith('"""', cursor) ? '"""' : character;
      cursor += quote.length - 1;
    } else if (this.source.startsWith(closing, cursor)) {
      return Math.min(end, cursor + closing.length);
    }

    cursor++;
  }

  return end;
}
