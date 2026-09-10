import { BlockNode } from '../../../../modules/conversion-core/model/ast/blocks/BlockNode';
import { InlineNode } from '../../../../modules/conversion-core/model/ast/inlines/InlineNode';

export function paragraph(children: InlineNode[]): BlockNode {
  return { type: 'paragraph', children };
}
