import { findDelimitedEnd } from '@/modules/conversion-core/lexing/boundaries/findDelimitedEnd';
import { findQuotedEnd } from '@/modules/conversion-core/lexing/boundaries/findQuotedEnd';
import { findLiteralEnd } from '@/modules/conversion-core/lexing/boundaries/findLiteralEnd';

/**
 * Locate the final `]]` of a TiddlyWiki image after skipping quoted attributes.
 * Return undefined when no image content bracket is found before a line break.
 *
 * ```ts
 * const source = '[img alt="[[literal]]"[photo.png]] [[outside]]';
 * const end = findTiddlyWikiImageEnd(source, 0);
 * source.slice(0, end); // '[img alt="[[literal]]"[photo.png]]'
 * lexSource(source, 'tiddlywiki').filter(({ kind }) => kind === 'link')
 *   .map(({ raw }) => raw); // ['[[outside]]']
 * findTiddlyWikiImageEnd('[img alt="x"\n[photo.png]]', 0); // undefined
 * lexSource('![alt](photo.png)', 'obsidian')[0].kind; // 'embed'
 * ```
 */
export function findTiddlyWikiImageEnd(
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
      cursor = findLiteralEnd(
        source,
        cursor + 3,
        source.slice(cursor, cursor + 3),
      );

      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      cursor = findLiteralEnd(source, cursor + 1, character);

      continue;
    }

    if (source.startsWith('{{{', cursor)) {
      cursor = findQuotedEnd(source, cursor + 3, '}}}');

      continue;
    }

    if (source.startsWith('{{', cursor)) {
      cursor = findQuotedEnd(source, cursor + 2, '}}');

      continue;
    }

    if (source.startsWith('<<', cursor)) {
      cursor = findQuotedEnd(source, cursor + 2, '>>');

      continue;
    }

    if (character === '[') {
      return findDelimitedEnd(source, cursor + 1, ']]');
    }

    cursor++;
  }

  return undefined;
}
