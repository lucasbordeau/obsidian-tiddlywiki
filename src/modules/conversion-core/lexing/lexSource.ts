import { Dialect } from '@/modules/conversion-core/model/Dialect';
import { SyntaxToken } from '@/modules/conversion-core/model/SyntaxToken';
import { scanNextToken } from '@/modules/conversion-core/lexing/scanners/scanNextToken';
import { indexMarkdownLabelEnds } from '@/modules/conversion-core/lexing/boundaries/indexMarkdownLabelEnds';
import { indexMarkdownBareParenthesisEnds } from '@/modules/conversion-core/lexing/boundaries/indexMarkdownBareParenthesisEnds';
import { LexingScanState } from '@/modules/conversion-core/lexing/LexingScanState';

/**
 * Partition source into ordered concrete tokens without discarding any text.
 * Every UTF-16 code unit belongs to one token. Ranges use exclusive ends;
 * scanner precedence decides which kind owns syntax inside a protected region.
 * Line prefix state advances with each token and treats CR, LF, and CRLF as
 * line breaks.
 *
 * ```ts
 * lexSource('# Notes\r[[Page]]', 'obsidian').map(({ kind, raw }) => [kind, raw]);
 * // [['block-marker', '#'], ['whitespace', ' '], ['text', 'Notes'],
 * //  ['whitespace', '\r'], ['link', '[[Page]]']]
 *
 * lexSource('! Notes\n[[Page]]', 'tiddlywiki').map(({ kind, raw }) => [kind, raw]);
 * // [['block-marker', '!'], ['whitespace', ' '], ['text', 'Notes'],
 * //  ['whitespace', '\n'], ['link', '[[Page]]']]
 *
 * lexSource('[[Page]]', 'obsidian')[0].range; // { start: 0, end: 8 }
 * ```
 */
export function lexSource(source: string, dialect: Dialect): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];

  const markdownLabelEnds =
    dialect === 'obsidian' ? indexMarkdownLabelEnds(source) : undefined;

  const markdownBareParenthesisEnds =
    dialect === 'obsidian'
      ? indexMarkdownBareParenthesisEnds(source)
      : undefined;

  const scanState: LexingScanState = {};
  let cursor = 0;
  let isLinePrefix = true;

  while (cursor < source.length) {
    const rest = source.slice(cursor);

    const matchedToken = scanNextToken({
      source,
      dialect,
      cursor,
      rest,
      isLinePrefix,
      markdownLabelEnds,
      markdownBareParenthesisEnds,
      scanState,
    });

    const raw = source.slice(cursor, matchedToken.end);

    const token: SyntaxToken = {
      kind: matchedToken.kind,
      range: { start: cursor, end: matchedToken.end },
      raw,
    };

    tokens.push(token);

    const lastLineBreak = Math.max(
      raw.lastIndexOf('\n'),
      raw.lastIndexOf('\r'),
    );

    const currentLineText = raw.slice(lastLineBreak + 1);

    isLinePrefix =
      (lastLineBreak >= 0 || isLinePrefix) && /^[ \t>]*$/.test(currentLineText);

    cursor = matchedToken.end;
  }

  return tokens;
}
