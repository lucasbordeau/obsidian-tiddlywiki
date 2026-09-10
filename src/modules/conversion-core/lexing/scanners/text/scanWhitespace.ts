import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';

export function scanWhitespace(context: LexingContext): TokenMatch | undefined {
  const { cursor, rest } = context;
  const whitespace = /^\s+/.exec(rest);

  if (whitespace) {
    return { kind: 'whitespace', end: cursor + whitespace[0].length };
  }

  return undefined;
}
