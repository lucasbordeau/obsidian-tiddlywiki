import { LexingContext } from '@/modules/conversion-core/lexing/LexingContext';
import { TokenMatch } from '@/modules/conversion-core/lexing/TokenMatch';
import { findDelimitedEnd } from '@/modules/conversion-core/lexing/boundaries/findDelimitedEnd';

/**
 * Recognize TiddlyWiki `{{...}}` and filtered `{{{...}}}` transclusions.
 * The opening width selects the corresponding closing delimiter.
 *
 * ```ts
 * lexSource('{{Note}}', 'tiddlywiki')[0];
 * // { kind: 'transclusion', range: { start: 0, end: 8 }, raw: '{{Note}}' }
 * lexSource('{{{ [tag[Note]] }}}', 'tiddlywiki')[0].kind;
 * // 'transclusion' for a filtered form
 * lexSource('![[Note]]', 'obsidian')[0];
 * // { kind: 'embed', range: { start: 0, end: 9 }, raw: '![[Note]]' }
 * // Obsidian embeds use wiki-link syntax instead of TiddlyWiki braces.
 * ```
 */
export function scanTransclusion(
  context: LexingContext,
): TokenMatch | undefined {
  const { source, dialect, cursor } = context;

  const transclusion =
    dialect === 'tiddlywiki' && source.startsWith('{{', cursor);

  if (transclusion) {
    const delimiter = source.startsWith('{{{', cursor) ? '}}}' : '}}';

    return {
      kind: 'transclusion',
      end: findDelimitedEnd(source, cursor + delimiter.length, delimiter),
    };
  }

  return undefined;
}
