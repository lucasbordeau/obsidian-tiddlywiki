/**
 * Index balanced parentheses within each whitespace-delimited source segment.
 * A bare Markdown destination stops at unescaped whitespace, so an opening `(`
 * with no indexed close cannot be part of a completed destination. Escaped
 * whitespace and parentheses retain their literal role in the same segment.
 *
 * ```ts
 * const ends = indexMarkdownBareParenthesisEnds('path(a)b unfinished(');
 * ends[4]; // 7: `path(a)` has a balanced inner pair
 * ends[19]; // undefined: the final `(` has no closer
 *
 * const escaped = indexMarkdownBareParenthesisEnds('path\\(a)');
 * escaped[5]; // undefined: `\\(` is literal text
 * ```
 */
export function indexMarkdownBareParenthesisEnds(
  source: string,
): readonly number[] {
  const parenthesisEnds: number[] = [];
  const openingPositions: number[] = [];

  for (let cursor = 0; cursor < source.length; cursor++) {
    const character = source[cursor];

    if (character === '\\') {
      cursor++;

      continue;
    }

    if (/[ \t\r\n]/.test(character)) {
      openingPositions.length = 0;

      continue;
    }

    if (character === '(') {
      openingPositions.push(cursor);

      continue;
    }

    if (character === ')') {
      const openingPosition = openingPositions.pop();

      if (openingPosition !== undefined) {
        parenthesisEnds[openingPosition] = cursor + 1;
      }
    }
  }

  return parenthesisEnds;
}
