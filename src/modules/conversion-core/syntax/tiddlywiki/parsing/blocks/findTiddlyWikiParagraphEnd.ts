import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function findTiddlyWikiParagraphEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): number {
  let cursor = start;

  while (cursor < end) {
    const remainder = this.source.slice(cursor, end);

    const boundary =
      /^\r?\n[ \t]*\r?\n/.test(remainder) || /^\r?\n\s*$/.test(remainder);

    if (boundary) {
      return cursor;
    }

    const protectedEnd = this.findProtectedEnd(cursor, end);

    cursor = protectedEnd > cursor ? protectedEnd : cursor + 1;
  }

  return end;
}
