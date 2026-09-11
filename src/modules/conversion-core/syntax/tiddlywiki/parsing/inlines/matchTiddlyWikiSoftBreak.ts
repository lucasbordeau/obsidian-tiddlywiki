import type { TiddlyWikiInlineMatch } from '../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../context/TiddlyWikiParsingContext';

export function matchTiddlyWikiSoftBreak(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('\r\n') || tail.startsWith('\n')) {
    const length = tail.startsWith('\r\n') ? 2 : 1;

    return {
      node: {
        type: 'break',
        hard: false,
        range: { start, end: start + length },
      },
      end: start + length,
    };
  }

  return undefined;
}
