import { BlockNode } from '../../../modules/conversion-core/model/blocks/BlockNode';
import { InlineNode } from '../../../modules/conversion-core/model/inlines/InlineNode';

export function createParagraph(children: InlineNode[]): BlockNode {
  return { type: 'paragraph', children };
}
