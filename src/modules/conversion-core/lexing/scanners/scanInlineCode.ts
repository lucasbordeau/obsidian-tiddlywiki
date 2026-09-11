import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';

export function scanInlineCode(context: LexingContext): TokenMatch | undefined {
  const { source, cursor, rest } = context;
  const codeDelimiter = /^`+/.exec(rest);

  if (codeDelimiter) {
    const delimiter = codeDelimiter[0];
    let closing = source.indexOf(delimiter, cursor + delimiter.length);

    while (closing >= 0) {
      const sharesLongerRun =
        source[closing - 1] === '`' ||
        source[closing + delimiter.length] === '`';

      if (!sharesLongerRun) {
        break;
      }

      closing = source.indexOf(delimiter, closing + delimiter.length);
    }

    return {
      kind: closing < 0 ? 'text' : 'code',
      end: closing < 0 ? cursor + delimiter.length : closing + delimiter.length,
    };
  }

  return undefined;
}
