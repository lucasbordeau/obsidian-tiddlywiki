import { Dialect } from '@/modules/conversion-core/model/Dialect';

/**
 * Scan complete lines after a fence opener for a closing run of the same marker.
 * Markdown closers may be longer than their opener and must retain the opener's
 * quote depth. A TiddlyWiki triple-backtick opener requires three unindented
 * backticks to close, beginning after one full content line. The returned
 * absolute offset includes the closing line's line ending, including a bare
 * carriage return. With no closer, it is EOF.
 *
 * ```ts
 * const markdown = '```\n> ```\n[[literal]]\n```\n[[link]]';
 * const markdownEnd = findFenceEnd(markdown, 0, '```', 'obsidian');
 * markdown.slice(0, markdownEnd); // '```\n> ```\n[[literal]]\n```\n'
 *
 * const quoted = '> ```\n> [[literal]]\n> ```\n[[link]]';
 * const quotedEnd = findFenceEnd(quoted, 2, '```', 'obsidian', 1); // 26
 * quoted.slice(0, quotedEnd); // '> ```\n> [[literal]]\n> ```\n'
 *
 * const wikiText = '```text\r[[literal]]\r```\r[[link]]';
 * const wikiTextEnd = findFenceEnd(wikiText, 0, '```', 'tiddlywiki');
 * wikiText.slice(0, wikiTextEnd); // '```text\r[[literal]]\r```\r'
 *
 * const immediateMarker = '```\n```\n[[inside]]';
 * findFenceEnd(immediateMarker, 0, '```', 'tiddlywiki'); // 18 (EOF)
 * ```
 */
export function findFenceEnd(
  source: string,
  start: number,
  marker: string,
  dialect: Dialect,
  quoteDepth = 0,
): number {
  const lineEndingPattern = /\r\n|\r|\n/g;

  lineEndingPattern.lastIndex = start;

  const openerLineEnding = lineEndingPattern.exec(source);

  if (!openerLineEnding) {
    return source.length;
  }

  let cursor = lineEndingPattern.lastIndex;
  let isFirstTiddlyWikiBodyLine = dialect === 'tiddlywiki';

  const countPattern =
    dialect === 'obsidian' ? `{${marker.length},}` : `{${marker.length}}`;

  const quotePrefix =
    quoteDepth > 0 ? `(?: {0,3}>[ \\t]?){${quoteDepth}} {0,3}` : ' {0,3}';

  const closingPrefix = dialect === 'obsidian' ? quotePrefix : '';

  const closingPattern = new RegExp(
    `^${closingPrefix}${marker[0]}${countPattern}[ \\t]*$`,
  );

  while (cursor < source.length) {
    const lineEnding = lineEndingPattern.exec(source);
    const end = lineEnding ? lineEnding.index : source.length;

    const isClosingLine =
      !isFirstTiddlyWikiBodyLine &&
      closingPattern.test(source.slice(cursor, end));

    if (isClosingLine) {
      return lineEnding ? lineEndingPattern.lastIndex : end;
    }

    isFirstTiddlyWikiBodyLine = false;
    cursor = lineEnding ? lineEndingPattern.lastIndex : source.length;
  }

  return source.length;
}
