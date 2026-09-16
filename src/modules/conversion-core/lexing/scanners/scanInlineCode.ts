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
  const { source, cursor, rest, scanState } = context;
  const codeDelimiter = /^`+/.exec(rest);

  if (codeDelimiter) {
    const delimiter = codeDelimiter[0];

    const closingEnds =
      scanState?.inlineCodeClosingEnds ?? indexBacktickRunClosers(source);

    if (scanState) {
      scanState.inlineCodeClosingEnds = closingEnds;
    }

    const closingEnd = closingEnds.get(cursor);

    return closingEnd === undefined
      ? { kind: 'text', end: cursor + delimiter.length }
      : { kind: 'code', end: closingEnd };
  }

  return undefined;
}

function indexBacktickRunClosers(source: string): Map<number, number> {
  const closingEnds = new Map<number, number>();
  const nextRunStartsByLength = new Map<number, number>();
  let cursor = source.length - 1;

  while (cursor >= 0) {
    if (source[cursor] !== '`') {
      cursor--;

      continue;
    }

    const runEnd = cursor + 1;

    while (cursor >= 0 && source[cursor] === '`') {
      cursor--;
    }

    const runStart = cursor + 1;
    const runLength = runEnd - runStart;
    const matchingStart = nextRunStartsByLength.get(runLength);

    if (matchingStart !== undefined) {
      closingEnds.set(runStart, matchingStart + runLength);
    }

    nextRunStartsByLength.set(runLength, runStart);
  }

  return closingEnds;
}
