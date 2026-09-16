import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';

const MARKDOWN_ESCAPABLE_PUNCTUATION =
  /^[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]$/;

/**
 * Consume a Markdown backslash escape for ASCII punctuation or a line break.
 * An ordinary letter or Unicode character after `\` stays text, so an astral
 * character is never split between an escape token and the next token.
 * TiddlyWiki has no Markdown backslash-escape token.
 *
 * ```ts
 * lexSource('\\*', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['escape', '\\*']]
 * lexSource('\\a', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['text', '\\'], ['text', 'a']]
 * lexSource('\\*', 'tiddlywiki').map(({ kind, raw }) => [kind, raw]);
 * // [['text', '\\'], ['text', '*']]
 * lexSource('\\\r\n[[Page]]', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['escape', '\\\r\n'], ['link', '[[Page]]']]
 * ```
 */
export function scanEscape(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const escapedCharacter = source[cursor + 1];

  const isPunctuationEscape = MARKDOWN_ESCAPABLE_PUNCTUATION.test(
    escapedCharacter ?? '',
  );

  const isLineBreakEscape =
    escapedCharacter === '\r' || escapedCharacter === '\n';

  const isEscapedCharacter =
    dialect === 'obsidian' &&
    source[cursor] === '\\' &&
    (isPunctuationEscape || isLineBreakEscape);

  if (isEscapedCharacter) {
    const isCrLf = escapedCharacter === '\r' && source[cursor + 2] === '\n';

    return { kind: 'escape', end: cursor + (isCrLf ? 3 : 2) };
  }

  return undefined;
}
