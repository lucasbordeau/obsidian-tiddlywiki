import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import { TIDDLYWIKI_FORMATTING_MARKERS } from '../../constants/TiddlyWikiFormattingMarkers.const';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiFormatting(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  for (const [marker, type] of TIDDLYWIKI_FORMATTING_MARKERS) {
    if (!tail.startsWith(marker)) {
      continue;
    }

    const final = this.findFormattingEnd(start + marker.length, end, marker);

    if (final < 0) {
      this.warn(
        'tw-unclosed-formatting',
        `The ${type} marker has no closing delimiter.`,
        { start, end },
      );

      return {
        node: this.rawInline(
          start,
          end,
          'Unfinished formatting retains its original source.',
        ),
        end,
      };
    }

    const contentStart = start + marker.length;

    return {
      node: {
        type,
        children: this.parseInline(contentStart, final, depth + 1),
        range: { start, end: final + marker.length },
      },
      end: final + marker.length,
    };
  }

  return undefined;
}
