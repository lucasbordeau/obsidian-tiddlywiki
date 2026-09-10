import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';
import { quotedEnd } from '../../boundaries/attributes/quotedEnd';

export function scanMacro(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isMacro =
    dialect === 'tiddlywiki' &&
    source.startsWith('<<', cursor) &&
    !source.startsWith('<<<', cursor);

  if (isMacro) {
    return { kind: 'macro', end: quotedEnd(source, cursor + 2, '>>') };
  }

  return undefined;
}
