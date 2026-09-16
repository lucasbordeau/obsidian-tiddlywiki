import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findDelimitedEnd } from '@/modules/conversion-core/lexing/boundaries/findDelimitedEnd';

/**
 * Recognize `[[...]]` links in both dialects and `![[...]]` Obsidian embeds.
 * Both forms stay on one line. Obsidian backslashes can protect a closer;
 * TiddlyWiki backslashes are ordinary link content. An unfinished opener is
 * text, allowing a later valid link to be recognized independently. A failed
 * line search is reused for later openers on that line.
 *
 * ```ts
 * lexSource('![[photo.png]] [[Page]]', 'obsidian')
 *   .map(({ kind, raw }) => ({ kind, raw }));
 * // [
 * //   { kind: 'embed', raw: '![[photo.png]]' },
 * //   { kind: 'whitespace', raw: ' ' },
 * //   { kind: 'link', raw: '[[Page]]' },
 * // ]
 * lexSource('[[C:\\]] [[real]]', 'tiddlywiki')
 *   .map(({ kind, raw }) => ({ kind, raw }));
 * // [
 * //   { kind: 'link', raw: '[[C:\\]]' },
 * //   { kind: 'whitespace', raw: ' ' },
 * //   { kind: 'link', raw: '[[real]]' },
 * // ]
 * lexSource('[[[[\n[[valid]]', 'obsidian')
 *   .map(({ kind, raw }) => [kind, raw]);
 * // [['text', '[['], ['text', '[['], ['whitespace', '\n'],
 * //  ['link', '[[valid]]']]
 * ```
 */
export function scanWikiReference(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor, scanState } = context;

  const isWikiEmbed =
    dialect === 'obsidian' && source.startsWith('![[', cursor);

  if (isWikiEmbed || source.startsWith('[[', cursor)) {
    const contentStart = cursor + (isWikiEmbed ? 3 : 2);

    const isWithinKnownUnclosedLine =
      scanState?.wikiUnclosedLineEnd !== undefined &&
      cursor < scanState.wikiUnclosedLineEnd;

    if (isWithinKnownUnclosedLine) {
      return { kind: 'text', end: contentStart };
    }

    const closingEnd = findDelimitedEnd(source, contentStart, ']]', {
      escapeBackslashes: dialect === 'obsidian',
      stopAtLineBreak: true,
      missingEnd: -1,
    });

    const hasClosingDelimiter = closingEnd >= 0;

    if (!hasClosingDelimiter) {
      const carriageReturnIndex = source.indexOf('\r', contentStart);
      const lineFeedIndex = source.indexOf('\n', contentStart);

      const lineEnd = Math.min(
        carriageReturnIndex < 0 ? source.length : carriageReturnIndex,
        lineFeedIndex < 0 ? source.length : lineFeedIndex,
      );

      if (scanState) {
        scanState.wikiUnclosedLineEnd = lineEnd;
      }

      return { kind: 'text', end: contentStart };
    }

    return {
      kind: isWikiEmbed ? 'embed' : 'link',
      end: closingEnd,
    };
  }

  return undefined;
}
