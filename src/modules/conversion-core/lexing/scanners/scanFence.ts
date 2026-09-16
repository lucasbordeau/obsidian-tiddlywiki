import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findFenceEnd } from '@/modules/conversion-core/lexing/boundaries/findFenceEnd';

/**
 * Recognize a complete fence opener at the current line position and shield its
 * body through the matching closer. Markdown allows up to three leading spaces;
 * a quote fence closes only inside the same quote depth. An invalid Markdown
 * opener-like line becomes text so an inline-code scan cannot swallow later
 * block lines. TiddlyWiki uses an unindented triple-backtick opener with an
 * optional word-like language name.
 *
 * ```ts
 * const markdown = '```js\n[[literal]]\n```\n[[link]]';
 * scanFence({ source: markdown, dialect: 'obsidian', cursor: 0,
 *   rest: markdown, isLinePrefix: true }); // { kind: 'code', end: 22 }
 * lexSource(markdown, 'obsidian')
 *   .filter((token) => token.kind === 'link')
 *   .map((token) => token.raw); // ['[[link]]']
 *
 * const quoted = '> ```\n> [[literal]]\n> ```\n[[link]]';
 * scanFence({ source: quoted, dialect: 'obsidian', cursor: 2,
 *   rest: quoted.slice(2), isLinePrefix: true }); // { kind: 'code', end: 26 }
 *
 * const invalidInfo = '```js`bad\n[[visible]]\n```';
 * scanFence({ source: invalidInfo, dialect: 'obsidian', cursor: 0,
 *   rest: invalidInfo, isLinePrefix: true }); // { kind: 'text', end: 9 }
 *
 * const wikiText = '```text\n[[literal]]\n```\n[[link]]';
 * scanFence({ source: wikiText, dialect: 'tiddlywiki', cursor: 0,
 *   rest: wikiText, isLinePrefix: true }); // { kind: 'code', end: 24 }
 * lexSource(wikiText, 'tiddlywiki')
 *   .filter((token) => token.kind === 'link')
 *   .map((token) => token.raw); // ['[[link]]']
 * ```
 */
export function scanFence(context: LexingContext): TokenMatch | undefined {
  const { source, dialect, cursor, rest, isLinePrefix } = context;
  const fence = isLinePrefix ? /^(\x60{3,}|~{3,})([^\r\n]*)/.exec(rest) : null;

  if (!fence) {
    return undefined;
  }

  const lineStart =
    Math.max(
      source.lastIndexOf('\n', cursor - 1),
      source.lastIndexOf('\r', cursor - 1),
    ) + 1;

  const linePrefix = source.slice(lineStart, cursor);
  const plainMarkdownPrefix = /^ {0,3}$/.test(linePrefix);
  const quotedMarkdownPrefix = /^(?: {0,3}>[ \t]?)+ {0,3}$/.test(linePrefix);

  const isMarkdownFence =
    dialect === 'obsidian' &&
    (plainMarkdownPrefix || quotedMarkdownPrefix) &&
    (fence[1][0] !== '`' || !fence[2].includes('`'));

  const isTiddlyWikiFence =
    dialect === 'tiddlywiki' &&
    linePrefix === '' &&
    fence[1] === '```' &&
    /^[\w-]*$/.test(fence[2]);

  if (!isMarkdownFence && !isTiddlyWikiFence) {
    if (dialect === 'obsidian') {
      return { kind: 'text', end: cursor + fence[0].length };
    }

    return undefined;
  }

  const quoteDepth = quotedMarkdownPrefix
    ? (linePrefix.match(/>/g) ?? []).length
    : 0;

  return {
    kind: 'code',
    end: findFenceEnd(source, cursor, fence[1], dialect, quoteDepth),
  };
}
