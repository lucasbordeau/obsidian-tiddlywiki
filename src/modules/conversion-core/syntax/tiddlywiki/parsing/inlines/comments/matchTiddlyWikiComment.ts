import { decodePreservedSource } from '../../../../../preservation/source/encoding/decodePreservedSource';
import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiComment(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('<!--')) {
    const closing = this.source.indexOf('-->', start + 4);
    const final = closing >= 0 && closing + 3 <= end ? closing + 3 : end;

    const capsule = decodePreservedSource(this.source.slice(start, final));

    if (capsule) {
      return {
        node: { type: 'raw', ...capsule, range: { start, end: final } },
        end: final,
      };
    }

    return {
      node: this.rawInline(
        start,
        final,
        'HTML comments retain their original source.',
      ),
      end: final,
    };
  }

  if (tail.startsWith('/%')) {
    const closing = this.source.indexOf('%/', start + 2);
    const final = closing >= 0 && closing + 2 <= end ? closing + 2 : end;

    return {
      node: this.rawInline(
        start,
        final,
        'TiddlyWiki comments retain their original source.',
      ),
      end: final,
    };
  }

  return undefined;
}
