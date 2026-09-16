import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

export function scanWhitespace(context: LexingContext): TokenMatch | undefined {
  const { cursor, rest } = context;
  const whitespace = /^\s+/.exec(rest);

  if (whitespace) {
    return { kind: 'whitespace', end: cursor + whitespace[0].length };
  }

  return undefined;
}
