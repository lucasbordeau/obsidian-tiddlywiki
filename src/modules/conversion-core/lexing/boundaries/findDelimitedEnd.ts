/**
 * Controls the escape and recovery rules of a delimiter search.
 * `escapeBackslashes` defaults to true for Obsidian-style escaped closers.
 * `stopAtLineBreak` bounds a wiki link to its line. `missingEnd` lets a scanner
 * request `-1` rather than an offset when no closer exists.
 *
 * ```ts
 * const wikiTextLink: DelimitedEndOptions = {
 *   escapeBackslashes: false,
 *   stopAtLineBreak: true,
 *   missingEnd: -1,
 * };
 * const obsidianWikiLink: DelimitedEndOptions = {
 *   escapeBackslashes: true,
 *   stopAtLineBreak: true,
 *   missingEnd: -1,
 * };
 * ```
 */
type DelimitedEndOptions = {
  escapeBackslashes?: boolean;
  stopAtLineBreak?: boolean;
  missingEnd?: number;
};

/**
 * Find the exclusive end of `closing` after an opening delimiter.
 * By default a backslash protects the following character, as in Obsidian
 * syntax. WikiText links treat backslashes literally; their caller disables
 * that rule. A line-bound search stops before the next CR or LF, so a malformed
 * opener cannot borrow the closer from a link on the following line.
 * An unsuccessful search returns its stopping offset, or `source.length`.
 * Callers that need to distinguish success can request a `-1` sentinel.
 *
 * ```ts
 * findDelimitedEnd('[[Note]]', 2, ']]'); // 8
 * findDelimitedEnd('[[a\\]]b]]', 2, ']]'); // 9, escaped Obsidian closer
 * findDelimitedEnd('[[C:\\]]', 2, ']]', { escapeBackslashes: false }); // 7
 * findDelimitedEnd('[[bad\n[[good]]', 2, ']]', {
 *   stopAtLineBreak: true,
 * }); // 5, the newline before the next link
 * findDelimitedEnd('[[bad\n[[good]]', 2, ']]', {
 *   stopAtLineBreak: true,
 *   missingEnd: -1,
 * }); // -1
 * ```
 */
export function findDelimitedEnd(
  source: string,
  start: number,
  closing: string,
  options: DelimitedEndOptions = {},
): number {
  const {
    escapeBackslashes = true,
    stopAtLineBreak = false,
    missingEnd = source.length,
  } = options;

  let cursor = start;

  while (cursor < source.length) {
    const character = source[cursor];

    if (stopAtLineBreak && (character === '\n' || character === '\r')) {
      return options.missingEnd ?? cursor;
    }

    if (escapeBackslashes && character === '\\') {
      const escapedCharacter = source[cursor + 1];

      const escapedLineBreak =
        stopAtLineBreak &&
        (escapedCharacter === '\n' || escapedCharacter === '\r');

      if (escapedLineBreak) {
        return options.missingEnd ?? cursor + 1;
      }

      cursor += 2;

      continue;
    }

    if (source.startsWith(closing, cursor)) {
      return cursor + closing.length;
    }

    cursor++;
  }

  return missingEnd;
}
