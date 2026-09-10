import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import type { SerializationContext } from '../../types/serialization/SerializationContext';

export function renderList(
  block: Extract<BlockNode, { type: 'list' }>,
  context: SerializationContext,
  alternate = false,
): string {
  return block.children
    .map((entry, index) => {
      const marker = block.ordered
        ? `${block.start + index}${alternate ? ')' : '.'} `
        : alternate
          ? '+ '
          : '- ';

      const taskMarker = entry.checked ? (entry.taskMarker ?? 'x') : ' ';
      const check = entry.checked === undefined ? '' : `[${taskMarker}] `;

      const body = `${check}${context.renderBlocks(entry.blocks)}`;
      const lines = body.split('\n');

      return `${marker}${lines[0]}${lines
        .slice(1)
        .map((line) => `\n${line ? ' '.repeat(marker.length) + line : ''}`)
        .join('')}`;
    })
    .join('\n');
}
