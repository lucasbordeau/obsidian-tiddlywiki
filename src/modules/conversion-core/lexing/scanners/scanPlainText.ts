import type { LexingContext } from '../LexingContext';
import type { TokenMatch } from '../TokenMatch';

export function scanPlainText(context: LexingContext): TokenMatch {
  const { cursor, rest } = context;
  const plainText = /^[^\s`[!{<\\*_~=$'/,^@]+/.exec(rest);

  return { kind: 'text', end: cursor + (plainText?.[0].length ?? 1) };
}
