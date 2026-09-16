import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

/**
 * Pair an opening backtick run with a later run of exactly the same length.
 * An unmatched run remains a text token so scanning continues.
 *
 * ```ts
 * lexSource('`[[literal]]` [[Note]]', 'obsidian')
 *   .map(({ kind, raw }) => [kind, raw]);
 * // [['code', '`[[literal]]`'], ['whitespace', ' '], ['link', '[[Note]]']]
 * lexSource('`code`', 'tiddlywiki')[0];
 * // { kind: 'code', range: { start: 0, end: 6 }, raw: '`code`' }
 * lexSource('``a`b`` [[Page]]', 'obsidian')
 *   .map(({ kind, raw }) => [kind, raw]);
 * // [['code', '``a`b``'], ['whitespace', ' '], ['link', '[[Page]]']]
 * ```
 */
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
