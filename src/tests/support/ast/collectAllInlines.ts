import { BlockNode } from '../../../modules/conversion-core/model/blocks/BlockNode';
import { InlineNode } from '../../../modules/conversion-core/model/inlines/InlineNode';

export function collectAllInlines(blocks: BlockNode[]): InlineNode[] {
  const descendants: InlineNode[] = [];

  const visitInlines = (inlines: InlineNode[]): void => {
    for (const inline of inlines) {
      descendants.push(inline);

      if ('children' in inline) {
        visitInlines(inline.children);
      }

      if (inline.type === 'link') {
        visitInlines(inline.label);
      }
    }
  };

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        visitInlines(block.children);

        break;
      case 'quote':
      case 'footnoteDefinition':
        descendants.push(...collectAllInlines(block.children));

        break;
      case 'list':
        for (const entry of block.children) {
          descendants.push(...collectAllInlines(entry.blocks));
        }

        break;
      case 'table':
        for (const cell of [...block.header, ...block.rows.flat()]) {
          visitInlines(cell);
        }

        break;
    }
  }

  return descendants;
}
