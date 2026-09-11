import type { InlineNode } from '../../../model/inlines/InlineNode';
import type { TiddlyWikiParsingContext } from './context/TiddlyWikiParsingContext';

export function preserveTiddlyWikiInline(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  reason: string,
): InlineNode {
  const range = { start, end };

  this.warn('tw-preserved-source', reason, range);

  return {
    type: 'raw',
    value: this.source.slice(start, end),
    dialect: 'tiddlywiki',
    reason,
    range,
  };
}
