import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';
import { findQuotedEnd } from '../boundaries/findQuotedEnd';

export function scanMacro(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const isMacro =
    dialect === 'tiddlywiki' &&
    source.startsWith('<<', cursor) &&
    !source.startsWith('<<<', cursor);

  if (isMacro) {
    return { kind: 'macro', end: findQuotedEnd(source, cursor + 2, '>>') };
  }

  return undefined;
}
