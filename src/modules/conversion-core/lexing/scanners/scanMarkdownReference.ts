import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findMarkdownLinkEnd } from '@/modules/conversion-core/lexing/boundaries/findMarkdownLinkEnd';

/**
 * Recognize an Obsidian Markdown link or image with a `(...)` destination.
 * The leading `!` selects an embed token. A missing closer leaves scanning to
 * later scanners. TiddlyWiki `[[...]]` links belong to `scanWikiReference`.
 *
 * ```ts
 * const link = lexSource('Read [Guide](guide.md).', 'obsidian');
 * link.find((token) => token.kind === 'link');
 * // { kind: 'link', range: { start: 5, end: 22 }, raw: '[Guide](guide.md)' }
 *
 * lexSource('![alt](photo.png)', 'obsidian')[0];
 * // { kind: 'embed', range: { start: 0, end: 17 }, raw: '![alt](photo.png)' }
 *
 * lexSource('[[Guide]]', 'tiddlywiki')[0];
 * // { kind: 'link', range: { start: 0, end: 9 }, raw: '[[Guide]]' }
 * scanMarkdownReference({
 *   source: '[[Guide]]', dialect: 'tiddlywiki', cursor: 0,
 *   rest: '[[Guide]]', isLinePrefix: true,
 * }); // undefined: the wiki scanner owns TiddlyWiki links
 * ```
 */
export function scanMarkdownReference(
  context: LexingContext,
): TokenMatch | undefined {
  const {
    source,
    dialect,
    cursor,
    markdownLabelEnds,
    markdownBareParenthesisEnds,
  } = context;

  const isMarkdownImage =
    dialect === 'obsidian' && source.startsWith('![', cursor);

  const isMarkdownLink = dialect === 'obsidian' && source[cursor] === '[';

  if (isMarkdownImage || isMarkdownLink) {
    const end = findMarkdownLinkEnd(
      source,
      cursor + (isMarkdownImage ? 1 : 0),
      markdownLabelEnds,
      markdownBareParenthesisEnds,
    );

    if (end !== undefined) {
      return { kind: isMarkdownImage ? 'embed' : 'link', end: end };
    }
  }

  return undefined;
}
