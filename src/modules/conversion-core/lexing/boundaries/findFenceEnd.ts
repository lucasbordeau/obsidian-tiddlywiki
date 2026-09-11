import type { Dialect } from '../../model/Dialect';

export function findFenceEnd(
  source: string,
  start: number,
  marker: string,
  dialect: Dialect,
): number {
  let cursor = source.indexOf('\n', start);

  if (cursor < 0) {
    return source.length;
  }

  cursor++;

  const countPattern =
    dialect === 'obsidian' ? `{${marker.length},}` : `{${marker.length}}`;

  const closingPattern = new RegExp(
    `^[ \\t]*(?:>[ \\t]*)*${marker[0]}${countPattern}[ \\t]*\\r?$`,
  );

  while (cursor < source.length) {
    const newline = source.indexOf('\n', cursor);
    const end = newline < 0 ? source.length : newline;

    if (closingPattern.test(source.slice(cursor, end))) {
      return newline < 0 ? end : end + 1;
    }

    cursor = end + 1;
  }

  return source.length;
}
