import { BlockNode } from '../../../../modules/conversion-core/model/ast/blocks/BlockNode';
import { InlineNode } from '../../../../modules/conversion-core/model/ast/inlines/InlineNode';

export function allInlines(blocks: BlockNode[]): InlineNode[] {
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
        descendants.push(...allInlines(block.children));

        break;
      case 'list':
        for (const entry of block.children) {
          descendants.push(...allInlines(entry.blocks));
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
