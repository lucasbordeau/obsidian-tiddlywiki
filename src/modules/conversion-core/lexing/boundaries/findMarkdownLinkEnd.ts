import { indexMarkdownLabelEnds } from '@/modules/conversion-core/lexing/boundaries/indexMarkdownLabelEnds';
import { indexMarkdownBareParenthesisEnds } from '@/modules/conversion-core/lexing/boundaries/indexMarkdownBareParenthesisEnds';

/**
 * Find the exclusive end of an Obsidian Markdown link or image from its `[`.
 * The balanced label is followed by a destination in `(...)`. Bare destinations
 * may contain quote characters; angle destinations may contain parentheses.
 * A title after whitespace may use single quotes, double quotes, or parentheses.
 * TiddlyWiki's `[[...]]` references use a separate boundary reader.
 * Precomputed label and bare-parenthesis indexes avoid rescanning failed
 * openers when the lexer visits many overlapping candidate links.
 *
 * ```ts
 * const bare = "[x](https://example.org/it's)";
 * findMarkdownLinkEnd(bare, 0); // 29, the end of the entire link
 *
 * const titled = '[x](<path/a)b> "title")';
 * findMarkdownLinkEnd(titled, 0); // 23, after the outer `)`
 *
 * const image = '![photo](photo.png)';
 * findMarkdownLinkEnd(image, 1); // 19; `!` is handled by the scanner
 * findMarkdownLinkEnd('[unfinished', 0); // undefined
 * findMarkdownLinkEnd('[x]([y](', 0); // undefined: unclosed nested destination
 * ```
 */
export function findMarkdownLinkEnd(
  source: string,
  start: number,
  markdownLabelEnds?: readonly number[],
  markdownBareParenthesisEnds?: readonly number[],
): number | undefined {
  const labelEnds = markdownLabelEnds ?? indexMarkdownLabelEnds(source);

  const bareParenthesisEnds =
    markdownBareParenthesisEnds ?? indexMarkdownBareParenthesisEnds(source);

  const labelEnd = labelEnds[start];

  if (labelEnd === undefined || source[labelEnd] !== '(') {
    return undefined;
  }

  let cursor = labelEnd + 1;

  while (/[ \t\r\n]/.test(source[cursor] ?? '')) {
    cursor++;
  }

  if (source[cursor] === '<') {
    cursor++;

    let foundAngleClose = false;

    while (cursor < source.length) {
      const character = source[cursor];

      if (character === '\\') {
        cursor += 2;

        continue;
      }

      if (character === '>') {
        cursor++;
        foundAngleClose = true;

        break;
      }

      if (character === '<' || character === '\r' || character === '\n') {
        return undefined;
      }

      cursor++;
    }

    if (!foundAngleClose) {
      return undefined;
    }
  } else {
    while (cursor < source.length) {
      const character = source[cursor];

      if (character === '\\') {
        cursor += 2;

        continue;
      }

      if (character === '(') {
        const matchingEnd = bareParenthesisEnds[cursor];

        if (matchingEnd === undefined) {
          return undefined;
        }

        cursor = matchingEnd;

        continue;
      } else if (character === ')') {
        break;
      } else if (/[ \t\r\n]/.test(character)) {
        break;
      }

      cursor++;
    }
  }

  const destinationEnd = cursor;

  while (/[ \t\r\n]/.test(source[cursor] ?? '')) {
    cursor++;
  }

  const hasTitleSeparator = cursor > destinationEnd;
  const titleOpener = source[cursor];

  const hasTitle =
    hasTitleSeparator &&
    (titleOpener === '"' || titleOpener === "'" || titleOpener === '(');

  if (hasTitle) {
    const titleCloser = titleOpener === '(' ? ')' : titleOpener;

    cursor++;

    let foundTitleClose = false;

    while (cursor < source.length) {
      const character = source[cursor];

      if (character === '\\') {
        cursor += 2;

        continue;
      }

      if (character === titleCloser) {
        cursor++;
        foundTitleClose = true;

        break;
      }

      cursor++;
    }

    if (!foundTitleClose) {
      return undefined;
    }

    while (/[ \t\r\n]/.test(source[cursor] ?? '')) {
      cursor++;
    }
  }

  return source[cursor] === ')' ? cursor + 1 : undefined;
}
