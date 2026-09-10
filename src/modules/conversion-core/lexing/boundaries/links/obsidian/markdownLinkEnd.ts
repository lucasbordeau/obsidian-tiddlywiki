export function markdownLinkEnd(
  source: string,
  start: number,
): number | undefined {
  let depth = 1;
  let cursor = start + 1;

  while (cursor < source.length && depth > 0) {
    if (source[cursor] === '\\') {
      cursor += 2;

      continue;
    }

    if (source[cursor] === '[') {
      depth++;
    }

    if (source[cursor] === ']') {
      depth--;
    }

    cursor++;
  }

  if (depth > 0 || source[cursor] !== '(') {
    return undefined;
  }

  depth = 1;
  cursor++;

  let quote = '';

  while (cursor < source.length && depth > 0) {
    const character = source[cursor];

    if (character === '\\') {
      cursor += 2;

      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = '';
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') {
      depth++;
    } else if (character === ')') {
      depth--;
    }

    cursor++;
  }

  return depth === 0 ? cursor : undefined;
}
