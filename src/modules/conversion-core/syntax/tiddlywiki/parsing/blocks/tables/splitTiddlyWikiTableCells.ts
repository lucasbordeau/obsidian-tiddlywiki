import type { SourceRange } from '../../../../../model/source/SourceRange';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function splitTiddlyWikiTableCells(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
): SourceRange[] {
  const cells: SourceRange[] = [];
  let cellStart = start;
  let cursor = start;

  while (cursor < end) {
    const protectedEnd = this.findProtectedEnd(cursor, end);

    if (protectedEnd > cursor) {
      cursor = protectedEnd;

      continue;
    }

    if (this.source[cursor] === '|') {
      cells.push({ start: cellStart, end: cursor });

      cellStart = cursor + 1;
    }

    cursor++;
  }

  cells.push({ start: cellStart, end });

  return cells;
}
