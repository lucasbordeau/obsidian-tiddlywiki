export function quotedEnd(
  source: string,
  start: number,
  closing: string,
): number {
  let cursor = start;
  let quote = '';

  while (cursor < source.length) {
    if (quote) {
      if (source.startsWith(quote, cursor)) {
        cursor += quote.length;
        quote = '';
      } else {
        cursor++;
      }

      continue;
    }

    if (source.startsWith(closing, cursor)) {
      return cursor + closing.length;
    }

    if (source.startsWith('"""', cursor)) {
      quote = '"""';
    } else if (source[cursor] === '"' || source[cursor] === "'") {
      quote = source[cursor];
    }

    cursor += quote.length || 1;
  }

  return source.length;
}
