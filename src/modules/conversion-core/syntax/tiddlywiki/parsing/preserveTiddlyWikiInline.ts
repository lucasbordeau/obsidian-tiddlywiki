import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

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
