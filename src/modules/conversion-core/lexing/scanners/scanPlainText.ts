import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

/**
 * Consume ordinary text until whitespace or a possible syntax opener.
 * When no run matches, consume one code unit to guarantee forward progress.
 *
 * ```ts
 * lexSource('hello world', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['text', 'hello'], ['whitespace', ' '], ['text', 'world']]
 * lexSource('hello world', 'tiddlywiki').map(({ kind, raw }) => [kind, raw]);
 * // [['text', 'hello'], ['whitespace', ' '], ['text', 'world']]
 * lexSource('hello [[Page]]', 'tiddlywiki').map(({ kind, raw }) => [kind, raw]);
 * // [['text', 'hello'], ['whitespace', ' '], ['link', '[[Page]]']]
 * ```
 */
export function scanPlainText(context: LexingContext): TokenMatch {
  const { cursor, rest } = context;
  const plainText = /^[^\s`[!{<\\*_~=$'/,^@]+/.exec(rest);

  return { kind: 'text', end: cursor + (plainText?.[0].length ?? 1) };
}
