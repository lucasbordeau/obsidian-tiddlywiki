import { decodeHTML } from 'entities';
import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

export function matchTiddlyWikiEntity(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);
  const entity = /^&(?:#x[\da-f]+|#\d+|[a-z][a-z\d]+);/i.exec(tail);

  if (entity) {
    const value = decodeHTML(entity[0]);

    return {
      node: {
        type: 'text',
        value,
        range: { start, end: start + entity[0].length },
      },
      end: start + entity[0].length,
    };
  }

  return undefined;
}
