import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';
import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { escapeHtml } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeHtml';
import { renderInline } from '@/modules/conversion-core/syntax/obsidian/serialization/inlines/renderInline';
import { escapeTablePipes } from '@/modules/conversion-core/syntax/obsidian/serialization/escaping/escapeTablePipes';

export function renderTable(
  block: Extract<BlockNode, { type: 'table' }>,
  context: SerializationContext,
): string {
  const renderCell = (cell: InlineNode[]): string => {
    const content = cell
      .map((node) => {
        if (node.type === 'break') {
          return '<br>';
        }

        const codeWithBackslashPipe =
          node.type === 'code' && /\\+\|/.test(node.value);

        if (codeWithBackslashPipe && node.type === 'code') {
          return `<code>${escapeHtml(node.value).replace(/\|/g, '&#124;')}</code>`;
        }

        return renderInline(node, context);
      })
      .join('');

    return escapeTablePipes(content);
  };

  const renderRow = (cells: InlineNode[][]): string =>
    `| ${cells.map(renderCell).join(' | ')} |`;

  const alignments = block.header.map((_, index) => {
    const alignment = block.alignments[index];

    return alignment === 'left'
      ? ':---'
      : alignment === 'right'
        ? '---:'
        : alignment === 'center'
          ? ':---:'
          : '---';
  });

  const separator = `| ${alignments.join(' | ')} |`;

  return [
    renderRow(block.header),
    separator,
    ...block.rows.map(renderRow),
  ].join('\n');
}
