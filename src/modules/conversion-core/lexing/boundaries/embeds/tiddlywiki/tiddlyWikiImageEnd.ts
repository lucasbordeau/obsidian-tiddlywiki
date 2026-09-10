import { delimitedEnd } from '../../delimiters/delimitedEnd';
import { quotedEnd } from '../../attributes/quotedEnd';
import { literalEnd } from '../../delimiters/literalEnd';

export function tiddlyWikiImageEnd(
  source: string,
  start: number,
): number | undefined {
  let cursor = start + 4;

  while (cursor < source.length) {
    const character = source[cursor];

    if (character === '\n' || character === '\r') {
      return undefined;
    }

    const tripleQuote =
      source.startsWith('"""', cursor) || source.startsWith('```', cursor);

    if (tripleQuote) {
      cursor = literalEnd(source, cursor + 3, source.slice(cursor, cursor + 3));

      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      cursor = literalEnd(source, cursor + 1, character);

      continue;
    }

    if (source.startsWith('{{{', cursor)) {
      cursor = quotedEnd(source, cursor + 3, '}}}');

      continue;
    }

    if (source.startsWith('{{', cursor)) {
      cursor = quotedEnd(source, cursor + 2, '}}');

      continue;
    }

    if (source.startsWith('<<', cursor)) {
      cursor = quotedEnd(source, cursor + 2, '>>');

      continue;
    }

    if (character === '[') {
      return delimitedEnd(source, cursor + 1, ']]');
    }

    cursor++;
  }

  return undefined;
}
