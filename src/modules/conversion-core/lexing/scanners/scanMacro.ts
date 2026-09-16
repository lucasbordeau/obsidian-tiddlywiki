import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findQuotedEnd } from '@/modules/conversion-core/lexing/boundaries/findQuotedEnd';

/**
 * Recognize a complete TiddlyWiki `<<...>>` macro call. Quoted and `[[...]]`
 * parameters shield their contents, including an inner `>>`, from the macro
 * closer. An unfinished `<<` becomes text so later valid syntax is still seen.
 * A source with no remaining raw `>>` rejects later openers in constant time.
 *
 * ```ts
 * const macro = '<<greet "Ada">>';
 * scanMacro({ source: macro, dialect: 'tiddlywiki', cursor: 0,
 *   rest: macro, isLinePrefix: true }); // { kind: 'macro', end: 15 }
 * scanMacro({ source: macro, dialect: 'obsidian', cursor: 0,
 *   rest: macro, isLinePrefix: true }); // undefined
 *
 * lexSource('<<greet "Ada">> [[Page]]', 'tiddlywiki')
 *   .map(({ kind, raw }) => ({ kind, raw }));
 * // [
 * //   { kind: 'macro', raw: '<<greet "Ada">>' },
 * //   { kind: 'whitespace', raw: ' ' },
 * //   { kind: 'link', raw: '[[Page]]' },
 * // ]
 * lexSource('<<foo [[a >> b]]>>', 'tiddlywiki')[0].raw;
 * // '<<foo [[a >> b]]>>'
 * lexSource('<<bad\n\n[[good]]', 'tiddlywiki')
 *   .filter((token) => token.kind === 'link')
 *   .map((token) => token.raw); // ['[[good]]']
 * lexSource('<<a<<a\n[[valid]]', 'tiddlywiki')
 *   .filter((token) => token.kind === 'link')
 *   .map((token) => token.raw); // ['[[valid]]']
 * ```
 */
export function scanMacro(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor, scanState } = context;

  const isMacro =
    dialect === 'tiddlywiki' &&
    source.startsWith('<<', cursor) &&
    !source.startsWith('<<<', cursor);

  if (isMacro) {
    const lastRawCloser =
      scanState?.macroLastRawCloser ?? source.lastIndexOf('>>');

    if (scanState) {
      scanState.macroLastRawCloser = lastRawCloser;
    }

    if (lastRawCloser < cursor + 2) {
      return { kind: 'text', end: cursor + 2 };
    }

    const closingEnd = findQuotedEnd(source, cursor + 2, '>>', {
      protectBracketedParameters: true,
      missingEnd: -1,
    });

    if (closingEnd >= 0) {
      return { kind: 'macro', end: closingEnd };
    }

    return { kind: 'text', end: cursor + 2 };
  }

  return undefined;
}
