import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';

export function scanEscape(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isEscapedCharacter =
    dialect === 'obsidian' &&
    source[cursor] === '\\' &&
    cursor + 1 < source.length;

  if (isEscapedCharacter) {
    return { kind: 'escape', end: cursor + 2 };
  }

  return undefined;
}
