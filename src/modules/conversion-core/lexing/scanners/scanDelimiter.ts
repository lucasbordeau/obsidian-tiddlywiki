import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';

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
