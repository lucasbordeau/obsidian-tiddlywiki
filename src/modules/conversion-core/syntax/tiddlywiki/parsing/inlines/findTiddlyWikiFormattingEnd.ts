import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function findTiddlyWikiFormattingEnd(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  marker: string,
): number {
  let cursor = start;

  while (cursor < end) {
    if (this.source.startsWith(marker, cursor)) {
      return cursor;
    }

    const protectedEnd = this.findProtectedEnd(cursor, end);

    cursor = protectedEnd > cursor ? protectedEnd : cursor + 1;
  }

  return -1;
}
