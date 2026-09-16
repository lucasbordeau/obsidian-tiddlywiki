import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { SerializationContext } from '@/modules/conversion-core/syntax/obsidian/types/SerializationContext';

export function renderList(
  block: Extract<BlockNode, { type: 'list' }>,
  context: SerializationContext,
  alternate = false,
): string {
  return block.children
    .map((listItem, index) => {
      const marker = block.ordered
        ? `${block.start + index}${alternate ? ')' : '.'} `
        : alternate
          ? '+ '
          : '- ';

      const taskMarker = listItem.checked ? (listItem.taskMarker ?? 'x') : ' ';

      const check = listItem.checked === undefined ? '' : `[${taskMarker}] `;

      const listItemBody = `${check}${context.renderBlocks(listItem.blocks, 'list-item')}`;
      const listItemLines = listItemBody.split('\n');
      const continuationIndent = ' '.repeat(Math.max(4, marker.length));

      return `${marker}${listItemLines[0]}${listItemLines
        .slice(1)
        .map((line) => `\n${line ? continuationIndent + line : ''}`)
        .join('')}`;
    })
    .join('\n');
}
