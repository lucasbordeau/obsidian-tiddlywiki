import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findQuotedEnd } from '@/modules/conversion-core/lexing/boundaries/findQuotedEnd';

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
