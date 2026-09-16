import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

/**
 * Group consecutive JavaScript whitespace code units into one token.
 * This includes indentation and line breaks.
 *
 * ```ts
 * lexSource('  text', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['whitespace', '  '], ['text', 'text']]
 * lexSource(' \r\ntext', 'tiddlywiki')[0];
 * // { kind: 'whitespace', range: { start: 0, end: 3 }, raw: ' \r\n' }
 * ```
 */
export function scanWhitespace(context: LexingContext): TokenMatch | undefined {
  const { cursor, rest } = context;
  const whitespace = /^\s+/.exec(rest);

  if (whitespace) {
    return { kind: 'whitespace', end: cursor + whitespace[0].length };
  }

  return undefined;
}
