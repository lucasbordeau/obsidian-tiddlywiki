import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

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
