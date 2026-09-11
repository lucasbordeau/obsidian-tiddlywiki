export function findDelimitedEnd(
  source: string,
  start: number,
  closing: string,
): number {
  let cursor = start;

  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2;

      continue;
    }

    if (source.startsWith(closing, cursor)) {
      return cursor + closing.length;
    }

    cursor++;
  }

  return source.length;
}
