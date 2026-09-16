import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

/**
 * Recognize formatting marker runs for the selected dialect.
 * Pairing and meaning are decided later by a dialect parser.
 *
 * ```ts
 * lexSource('**bold**', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['delimiter', '**'], ['text', 'bold'], ['delimiter', '**']]
 * lexSource("''bold''", 'tiddlywiki').map(({ kind, raw }) => [kind, raw]);
 * // [['delimiter', "''"], ['text', 'bold'], ['delimiter', "''"]]
 * lexSource('**open', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['delimiter', '**'], ['text', 'open']]: pairing is a parser decision.
 * ```
 */
export function scanDelimiter(context: LexingContext): TokenMatch | undefined {
  const { dialect, cursor, rest } = context;

  const delimiter =
    dialect === 'obsidian'
      ? /^(?:\*+|_+|~~|==|\${1,2})/.exec(rest)
      : /^(?:''|\/\/|__|~~|\^\^|,,|@@)/.exec(rest);

  if (delimiter) {
    return { kind: 'delimiter', end: cursor + delimiter[0].length };
  }

  return undefined;
}
