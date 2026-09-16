import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

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
