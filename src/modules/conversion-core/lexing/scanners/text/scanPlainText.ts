import type { LexingContext } from '../../context/LexingContext';
import type { TokenMatch } from '../../matches/TokenMatch';

export function scanPlainText(context: LexingContext): TokenMatch {
  const { cursor, rest } = context;
  const plainText = /^[^\s`[!{<\\*_~=$'/,^@]+/.exec(rest);

  return { kind: 'text', end: cursor + (plainText?.[0].length ?? 1) };
}
