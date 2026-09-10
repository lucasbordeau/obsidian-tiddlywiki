import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { TiddlyWikiParsingContext } from '../context/types/TiddlyWikiParsingContext';

export function preserveTiddlyWikiBlock(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  reason: string,
): BlockNode {
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
