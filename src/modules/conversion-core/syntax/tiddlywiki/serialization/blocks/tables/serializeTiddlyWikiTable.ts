import type { BlockNode } from '../../../../../model/ast/blocks/BlockNode';
import type { InlineNode } from '../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiSerializationContext } from '../../context/types/TiddlyWikiSerializationContext';

export function serializeTiddlyWikiTable(
  this: TiddlyWikiSerializationContext,
  block: Extract<BlockNode, { type: 'table' }>,
): string {
  const serializeCell = (
    children: InlineNode[],
    column: number,
    header: boolean,
  ) => {
    const content = (header ? '!' : '') + this.serializeInline(children);
    const alignment = block.alignments[column];

    if (alignment === 'left') {
      return content + ' ';
    }

    if (alignment === 'right') {
      return ' ' + content;
    }

    if (alignment === 'center') {
      return ' ' + content + ' ';
    }

    return content;
  };

  const header =
    '|' +
    block.header
      .map((cell, column) => serializeCell(cell, column, true))
      .join('|') +
    '|';

  const body = block.rows.map(
    (row) =>
      '|' +
      row.map((cell, column) => serializeCell(cell, column, false)).join('|') +
      '|',
  );

  return [header, ...body].join('\n');
}
