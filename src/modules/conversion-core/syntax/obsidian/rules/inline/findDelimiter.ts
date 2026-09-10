export function findDelimiter(
  source: string,
  delimiter: string,
  start: number,
  skipCode = false,
): number {
  let position = start;

  while (position < source.length) {
    if (source[position] === '\\') {
      position += 2;

      continue;
    }

    if (skipCode && source[position] === '`') {
      const run = /^`+/.exec(source.slice(position))?.[0] ?? '`';
      const backticks = /`+/g;

      backticks.lastIndex = position + run.length;

      let closingRun: RegExpExecArray | null;
      let end = -1;

      while ((closingRun = backticks.exec(source)) !== null) {
        if (closingRun[0].length !== run.length) {
          continue;
        }

        end = closingRun.index;

        break;
      }

      if (end !== -1) {
        position = end + run.length;

        continue;
      }
    }

    if (source.startsWith(delimiter, position)) {
      return position;
    }

    position++;
  }

  return -1;
}
