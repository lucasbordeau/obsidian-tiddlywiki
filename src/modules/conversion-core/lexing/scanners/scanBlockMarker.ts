import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

/**
 * Recognize a dialect's heading, list, quote, table, or directive marker.
 * Only a cursor in the current line's whitespace/quote prefix can match.
 *
 * ```ts
 * lexSource('# Heading', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['block-marker', '#'], ['whitespace', ' '], ['text', 'Heading']]
 * lexSource('!Heading', 'tiddlywiki').map(({ kind, raw }) => [kind, raw]);
 * // [['block-marker', '!'], ['text', 'Heading']]
 * ```
 */
export function scanBlockMarker(
  context: LexingContext,
): TokenMatch | undefined {
  const { dialect, cursor, rest, isLinePrefix } = context;

  const blockMarker =
    dialect === 'obsidian'
      ? /^(?:#{1,6}(?=[ \t]|$)|[-+*](?=[ \t])|\d+[.)](?=[ \t])|>|\|)/.exec(rest)
      : /^(?:!{1,6}|[*#;:]+|<{3,}|>|\||\\[A-Za-z]+)/.exec(rest);

  if (isLinePrefix && blockMarker) {
    return { kind: 'block-marker', end: cursor + blockMarker[0].length };
  }

  return undefined;
}
