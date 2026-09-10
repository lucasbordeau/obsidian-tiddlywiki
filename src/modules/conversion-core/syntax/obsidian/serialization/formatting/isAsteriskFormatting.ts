import type { InlineNode } from '../../../../model/ast/inlines/InlineNode';

export function isAsteriskFormatting(node: InlineNode | undefined): boolean {
  return node?.type === 'strong' || node?.type === 'emphasis';
}
